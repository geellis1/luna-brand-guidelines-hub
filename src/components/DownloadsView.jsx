// Brand files people can take away. Files live in public/fonts.
const FONTS = [
  {
    name: 'Shunsine',
    use: 'The LUNA wordmark',
    family: "'ShunsineFont'",
    sample: 'LUNA',
    file: '/fonts/Shunsine.otf',
  },
  {
    name: 'Cotoris Bold',
    use: 'CIVIC STRATEGIES, set in all caps',
    family: "'CotorisFont'",
    sample: 'CIVIC STRATEGIES',
    file: '/fonts/CotorisBold.otf',
  },
]

export function DownloadsView() {
  return (
    <section className="downloads" aria-labelledby="downloads-fonts">
      <h2 id="downloads-fonts" className="section-label">
        Fonts
      </h2>
      <div className="card-grid card-grid--logos">
        {FONTS.map((font) => (
          <article key={font.name} className="card download-card">
            <div className="card-stage card-stage--logo">
              <span className="download-sample" style={{ fontFamily: font.family }}>
                {font.sample}
              </span>
            </div>
            <div className="download-body">
              <div>
                <h3 className="download-name">{font.name}</h3>
                <p className="download-use">Used for: {font.use}</p>
              </div>
              <a className="button button--small" href={font.file} download>
                Download .otf
              </a>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
