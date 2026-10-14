import { useRef, useState } from 'react'
import { PDFDocument } from 'pdf-lib'
import {
  ArrowDownToLine, ArrowRight, ArrowUpRight, Check, FileImage,
  FileText, Files, Fingerprint, Layers3, LockKeyhole, Menu, Plus, ShieldCheck,
  Sparkles, Upload, X
} from 'lucide-react'

type ImageItem = { file: File; url: string }

const tools = [
  { icon: FileImage, title: 'Images to PDF', copy: 'Turn a collection of images into one tidy document.', tone: 'lime', active: true },
  { icon: Layers3, title: 'Merge PDFs', copy: 'Bring separate documents together in seconds.', tone: 'blue', active: false },
  { icon: Files, title: 'Split PDF', copy: 'Separate pages into smaller, focused files.', tone: 'peach', active: false },
  { icon: Sparkles, title: 'Compress PDF', copy: 'Make files lighter when the document allows it.', tone: 'violet', active: false },
]

export default function App() {
  const picker = useRef<HTMLInputElement>(null)
  const [items, setItems] = useState<ImageItem[]>([])
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [mobileMenu, setMobileMenu] = useState(false)

  function openPicker() {
    if (picker.current) {
      picker.current.click()
    } else {
      setMessage('The file picker is still loading. Please refresh the page and try again.')
    }
  }

  function addFiles(fileList: FileList | null) {
    if (!fileList) return
    const incoming = Array.from(fileList)
    const valid = incoming.filter(file => ['image/jpeg', 'image/png', 'image/webp'].includes(file.type))
    const rejected = incoming.length - valid.length
    setItems(previous => [...previous, ...valid.map(file => ({ file, url: URL.createObjectURL(file) }))])
    setMessage(rejected ? `${rejected} file(s) skipped. Choose JPG, PNG or WebP images.` : '')
    if (valid.length && !rejected) setMessage('')
  }

  function removeItem(index: number) {
    setItems(previous => {
      URL.revokeObjectURL(previous[index].url)
      return previous.filter((_, i) => i !== index)
    })
  }

  function moveItem(index: number, direction: -1 | 1) {
    setItems(previous => {
      const next = [...previous]
      const target = index + direction
      if (target < 0 || target >= next.length) return previous
      ;[next[index], next[target]] = [next[target], next[index]]
      return next
    })
  }

  async function createPdf() {
    if (!items.length || busy) return
    setBusy(true)
    setMessage('')
    try {
      const pdf = await PDFDocument.create()
      for (const item of items) {
        const bytes = await item.file.arrayBuffer()
        let image
        if (item.file.type === 'image/jpeg') image = await pdf.embedJpg(bytes)
        else if (item.file.type === 'image/png') image = await pdf.embedPng(bytes)
        else {
          // WebP is decoded by the browser and converted to PNG to ensure PDF compatibility.
          const bitmap = await createImageBitmap(item.file)
          const canvas = document.createElement('canvas')
          canvas.width = bitmap.width
          canvas.height = bitmap.height
          const context = canvas.getContext('2d')
          if (!context) throw new Error('Could not process one of the images.')
          context.drawImage(bitmap, 0, 0)
          bitmap.close()
          const blob = await new Promise<Blob>((resolve, reject) =>
            canvas.toBlob(result => result ? resolve(result) : reject(new Error('Image conversion failed.')), 'image/png')
          )
          image = await pdf.embedPng(await blob.arrayBuffer())
        }
        const page = pdf.addPage([image.width, image.height])
        page.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height })
      }
      const output = await pdf.save()
      const blob = new Blob([output as BlobPart], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'paperflow-document.pdf'
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.setTimeout(() => URL.revokeObjectURL(url), 1500)
      setMessage(`Your PDF is ready · ${items.length} page${items.length === 1 ? '' : 's'}.`)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Something went wrong. Please try another image.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="site-shell">
      <div className="ambient ambient-one" aria-hidden="true" />
      <div className="ambient ambient-two" aria-hidden="true" />
      <div className="ambient ambient-three" aria-hidden="true" />
      <div className="orbital orbital-one" aria-hidden="true" />
      <div className="orbital orbital-two" aria-hidden="true" />

      <header className="topbar">
        <a className="brand" href="#" aria-label="Paperflow home">
          <span className="brand-mark"><Files size={18} strokeWidth={1.8} /></span>
          <span>paperflow<span className="brand-period">.</span></span>
        </a>
        <nav className={mobileMenu ? 'nav-links nav-open' : 'nav-links'}>
          <a href="#tools" onClick={() => setMobileMenu(false)}>Explore tools</a>
          <a href="#privacy" onClick={() => setMobileMenu(false)}>Our approach</a>
          <a href="#about" onClick={() => setMobileMenu(false)}>About</a>
        </nav>
        <button className="top-action" onClick={openPicker}>
          Start converting <ArrowUpRight size={15} />
        </button>
        <button className="menu-toggle" aria-label="Toggle navigation" onClick={() => setMobileMenu(!mobileMenu)}>
          {mobileMenu ? <X size={21} /> : <Menu size={21} />}
        </button>
      </header>

      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow"><span className="eyebrow-dot" /> A calmer way to work with documents</div>
          <h1>Documents,<br /><span>without friction.</span></h1>
          <p className="hero-description">A little more clarity in your workflow. Convert, collect and refine your files in a space designed to feel effortless.</p>
          <div className="hero-actions">
            <button className="primary-button" onClick={openPicker}>Make your first PDF <ArrowRight size={17} /></button>
            <a className="quiet-link" href="#tools">Explore the tools <span>↓</span></a>
          </div>
          <div className="trust-line"><ShieldCheck size={16} /><span>Files are processed in your browser for this tool.</span></div>
        </div>

        <div className="visual-stage">
          <div className="stage-glow" />
          <div className="glass-orbit orbit-a" />
          <div className="glass-orbit orbit-b" />
          <div className="floating-label label-top"><span className="status-pip" /> YOUR WORKSPACE <span className="label-index">01 / 04</span></div>
          <div className="glass-card main-glass">
            <div className="glass-card-top">
              <div className="mini-icon"><FileText size={17} /></div>
              <span className="card-kicker">DOCUMENT STUDIO</span>
              <span className="live-dot" />
            </div>
            <div className="document-art">
              <div className="doc-sheet sheet-back"><div /><div /><div /><div /></div>
              <div className="doc-sheet sheet-front">
                <div className="sheet-heading"><span /><span /></div>
                <div className="sheet-lines"><i /><i /><i /><i /></div>
                <div className="sheet-chart"><b /><b /><b /><b /><b /><b /></div>
                <div className="sheet-foot"><span /><span /></div>
              </div>
              <div className="glass-bubble"><Sparkles size={19} /></div>
            </div>
            <div className="glass-card-bottom">
              <div><strong>Something beautifully simple.</strong><span>Ready when you are.</span></div>
              <div className="round-arrow"><ArrowUpRight size={17} /></div>
            </div>
          </div>
          <div className="floating-stat stat-left"><span className="stat-icon"><LockKeyhole size={14} /></span><span><b>Local-first</b><small>Your files stay close</small></span></div>
          <div className="floating-stat stat-right"><span className="stat-icon stat-icon-lime"><Sparkles size={14} /></span><span><b>Less friction</b><small>More flow</small></span></div>
          <div className="stage-caption"><span>01</span><span className="caption-line" /><span>Quietly capable</span></div>
        </div>
      </section>

      <section className="tool-section" id="tools">
        <div className="section-heading">
          <div><div className="eyebrow"><span className="eyebrow-dot" /> THE TOOLKIT</div><h2>Small tasks.<br /><span>Clear head.</span></h2></div>
          <p>Thoughtful tools for the little document jobs that shouldn't take all afternoon.</p>
        </div>
        <div className="tool-grid">
          {tools.map((tool, index) => {
            const Icon = tool.icon
            return <button className={`tool-card tone-${tool.tone}`} key={tool.title} onClick={() => tool.active ? picker.current?.click() : setMessage(`${tool.title} is planned for a future release. Image to PDF is available now.`)}>
              <div className="tool-card-top"><span className="tool-icon"><Icon size={20} strokeWidth={1.7} /></span><span className="tool-number">0{index + 1}</span></div>
              <div className="tool-card-copy"><h3>{tool.title}</h3><p>{tool.copy}</p></div>
              <div className="tool-card-bottom"><span>{tool.active ? 'Open tool' : 'Coming soon'}</span><span className="tool-arrow"><ArrowUpRight size={16} /></span></div>
            </button>
          })}
        </div>
      </section>

      <section className="converter-section" id="convert">
        <div className="converter-intro">
          <div className="eyebrow"><span className="eyebrow-dot" /> YOUR FIRST CONVERSION</div>
          <h2>Let the files<br /><span>fall into place.</span></h2>
          <p>Bring in your images, arrange the order, and leave with a clean PDF. No account, no upload queue, no unnecessary ceremony.</p>
          <div className="privacy-note"><Fingerprint size={19} /><span><b>Private by design</b><small>Image-to-PDF runs on your device.</small></span></div>
        </div>
        <div className="converter-panel glass-panel">
          <div className="panel-heading"><div><span className="panel-overline">IMAGE CONVERTER</span><h3>Your document</h3></div><span className="step-pill">STEP 01 <ArrowRight size={12} /> 02</span></div>
          <input className="file-input" ref={picker} type="file" accept="image/jpeg,image/png,image/webp" multiple aria-label="Choose images for PDF" onChange={event => { addFiles(event.target.files); event.currentTarget.value = '' }} />
          <button className="dropzone" onClick={openPicker} onDragOver={event => { event.preventDefault(); event.currentTarget.classList.add('dragging') }} onDragLeave={event => event.currentTarget.classList.remove('dragging')} onDrop={event => { event.preventDefault(); event.currentTarget.classList.remove('dragging'); addFiles(event.dataTransfer.files) }}>
            <span className="upload-symbol"><Upload size={22} /></span>
            <strong>Drop images into the light</strong>
            <span>or <u>browse your device</u></span>
            <small>JPG · PNG · WebP</small>
          </button>
          {items.length > 0 && <div className="file-list">
            <div className="file-list-head"><span>{items.length} image{items.length === 1 ? '' : 's'} selected</span><button onClick={() => { items.forEach(item => URL.revokeObjectURL(item.url)); setItems([]); setMessage('') }}>Clear all</button></div>
            {items.map((item, index) => <div className="file-row" key={`${item.file.name}-${index}`}>
              <img src={item.url} alt="" /><span className="file-name">{item.file.name}</span><small>{(item.file.size / 1024).toFixed(0)} KB</small>
              <div className="file-controls"><button aria-label="Move image up" disabled={index === 0} onClick={() => moveItem(index, -1)}>↑</button><button aria-label="Move image down" disabled={index === items.length - 1} onClick={() => moveItem(index, 1)}>↓</button><button aria-label="Remove image" onClick={() => removeItem(index)}><X size={14} /></button></div>
            </div>)}
            <button className="add-more" onClick={openPicker}><Plus size={15} /> Add more images</button>
          </div>}
          <div className="panel-footer"><span><LockKeyhole size={13} /> Processed locally</span><button className="convert-button" disabled={!items.length || busy} onClick={createPdf}>{busy ? 'Creating PDF…' : 'Create PDF'} {busy ? <span className="spinner" /> : <ArrowDownToLine size={16} />}</button></div>
          {message && <div className={message.includes('ready') ? 'status-message success' : 'status-message'} role="status">{message.includes('ready') && <Check size={15} />}{message}</div>}
        </div>
      </section>

      <section className="privacy-section" id="privacy">
        <div className="privacy-orb" aria-hidden="true" />
        <div className="privacy-content"><div className="eyebrow"><span className="eyebrow-dot" /> A DIFFERENT KIND OF UTILITY</div><h2>Your documents<br />are <span>not our business.</span></h2><p>For image-to-PDF, your selected images are processed locally in your browser. They aren't sent to a Paperflow conversion server.</p><div className="privacy-points"><span><Check size={15} /> No account required</span><span><Check size={15} /> No server upload for this tool</span><span><Check size={15} /> Works on desktop and mobile browsers</span></div></div>
        <div className="privacy-glass"><LockKeyhole size={25} /><div className="privacy-glass-line" /><span>YOUR FILES</span><strong>Stay yours.</strong><small>Local processing · Image to PDF</small><div className="privacy-glass-foot"><span className="live-dot" /> SESSION SECURE</div></div>
      </section>

      <footer className="footer" id="about"><a className="brand footer-brand" href="#"><span className="brand-mark"><Files size={17} /></span><span>paperflow<span className="brand-period">.</span></span></a><span>Make room for a clearer workflow.</span><span className="footer-right">A SMALL TOOL FOR A LESS CLUTTERED DAY <span>© 2026</span></span></footer>
      {message && <div className="toast" role="status">{message}<button onClick={() => setMessage('')} aria-label="Dismiss message"><X size={15} /></button></div>}
    </main>
  )
}