import './App.css'

const eventDetails = [
  { label: 'Ngày cưới', value: '12.10.2026' },
  { label: 'Giờ', value: '10:30 sáng' },
  { label: 'Địa điểm', value: 'Khách sạn Aurora, Hà Nội' },
]

const timeline = [
  { time: '08:30', title: 'Tiếp khách', text: 'Đón tiếp và chào mừng quý khách cùng thưởng thức ly trà.' },
  { time: '10:00', title: 'Lễ cưới', text: 'Không khí vui tươi, lời nguyện cầu và hình ảnh trọn vẹn cho ngày vui.' },
  { time: '12:00', title: 'Tiệc cưới', text: 'Bữa tiệc sum vầy, cùng nhau chia sẻ niềm hạnh phúc.' },
]

function App() {
  return (
    <div className="wedding-page">
      <header className="hero-section">
        <div className="hero-card">
          <p className="eyebrow">Lời mời thân thương</p>
          <h1>Vân Anh &amp; Minh Đức</h1>
          <p className="subtitle">Sẽ cùng nhau tổ chức tiệc cưới và kính mời bạn đến chia vui cùng gia đình.</p>

          <div className="date-pill">12.10.2026</div>

          <div className="details-grid">
            {eventDetails.map((item) => (
              <div key={item.label} className="detail-box">
                <span>{item.label}</span>
                <strong>{item.value}</strong>
              </div>
            ))}
          </div>
        </div>
      </header>

      <main className="content">
        <section className="story section-card">
          <p className="section-kicker">Câu chuyện của chúng tôi</p>
          <h2>Những bước chân đã gặp nhau</h2>
          <p>
            Từ những ngày đầu gặp gỡ cho đến khi cùng nhau xây dựng một mái ấm, mỗi khoảnh
            khắc đã dần thành một phần ký ức đẹp. Chúng tôi rất hân hạnh được mời bạn cùng
            chứng kiến và chúc phúc cho ngày hạnh phúc của mình.
          </p>
        </section>

        <section className="timeline section-card">
          <p className="section-kicker">Lịch trình</p>
          <h2>Ngày vui đặc biệt</h2>
          <div className="timeline-list">
            {timeline.map((item) => (
              <div key={item.time} className="timeline-item">
                <div className="time">{item.time}</div>
                <div className="line" aria-hidden="true" />
                <div className="timeline-copy">
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rsvp section-card">
          <p className="section-kicker">Xác nhận</p>
          <h2>Rất mong được đón tiếp</h2>
          <p>
            Xin vui lòng xác nhận tham dự trước ngày 20/09/2026 để gia đình chuẩn bị chu đáo
            cho một ngày cưới trọn vẹn.
          </p>
          <button type="button">Xác nhận tham dự</button>
        </section>
      </main>
    </div>
  )
}

export default App
