import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div className="container">
      <h1>CareMate</h1>
      <p>스마트폰 A/S 보험 통합관리 플랫폼</p>
      <ul style={{ marginTop: 24, listStyle: 'none' }}>
        <li><Link to="/customer/insurances">고객 - 보험 관리</Link></li>
        <li><Link to="/customer/repair-request">고객 - 비대면 A/S 접수</Link></li>
        <li><Link to="/repairshop">수리점 대시보드</Link></li>
        <li><Link to="/repairshop/lms">수리점 LMS 가이드</Link></li>
        <li><Link to="/admin">관리자</Link></li>
      </ul>
    </div>
  )
}
