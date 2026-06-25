import { useState, useEffect } from 'react'
import ShopLayout from '../../components/repairshop/ShopLayout.jsx'
import { getShopProfile, updateShopProfile, getOperatingHours, updateOperatingHours } from '../../api/repairshopApi.js'
import './ShopProfile.css'

const DAYS_KO = ['일', '월', '화', '수', '목', '금', '토']

const DEFAULT_HOURS = Array.from({ length: 7 }, (_, i) => ({
  dayOfWeek: i,
  openTime: i === 0 ? null : '09:00',
  closeTime: i === 0 ? null : '18:00',
  isClosed: i === 0,
}))

const MOCK_PROFILE = {
  shopName: '강남 스마트케어',
  address: '강남구 테헤란로 152',
  phone: '02-1234-5678',
  latitude: 37.5012,
  longitude: 127.0396,
}

export default function ShopProfile() {
  const [profile, setProfile] = useState(MOCK_PROFILE)
  const [hours, setHours] = useState(DEFAULT_HOURS)
  const [profileLoading, setProfileLoading] = useState(false)
  const [hoursLoading, setHoursLoading] = useState(false)
  const [profileSaved, setProfileSaved] = useState(false)
  const [hoursSaved, setHoursSaved] = useState(false)

  useEffect(() => {
    getShopProfile().then(setProfile).catch(() => {})
    getOperatingHours()
      .then(d => { if (d?.hours) setHours(d.hours) })
      .catch(() => {})
  }, [])

  function handleProfileChange(field, val) {
    setProfile(p => ({ ...p, [field]: val }))
  }

  async function saveProfile(e) {
    e.preventDefault()
    setProfileLoading(true)
    try {
      await updateShopProfile(profile)
      setProfileSaved(true)
      setTimeout(() => setProfileSaved(false), 2500)
    } catch {
      alert('저장 중 오류가 발생했습니다.')
    } finally {
      setProfileLoading(false)
    }
  }

  function handleHourChange(idx, field, val) {
    setHours(h => h.map((row, i) => i === idx ? { ...row, [field]: val } : row))
  }

  function toggleClosed(idx) {
    setHours(h => h.map((row, i) =>
      i === idx ? { ...row, isClosed: !row.isClosed, openTime: null, closeTime: null } : row
    ))
  }

  async function saveHours(e) {
    e.preventDefault()
    setHoursLoading(true)
    try {
      await updateOperatingHours({ hours })
      setHoursSaved(true)
      setTimeout(() => setHoursSaved(false), 2500)
    } catch {
      alert('저장 중 오류가 발생했습니다.')
    } finally {
      setHoursLoading(false)
    }
  }

  return (
    <ShopLayout>
      <h1 className="page-title">매장 프로필 관리</h1>
      <p className="page-subtitle">매장 정보와 운영시간을 설정합니다.</p>

      <div className="sp-grid">
        {/* Profile form */}
        <div className="card sp-card">
          <h2 className="sp-section-title">기본 정보</h2>
          <form onSubmit={saveProfile}>
            <div className="sp-form-group">
              <label className="sp-label">매장명</label>
              <input
                className="sp-input"
                value={profile.shopName ?? ''}
                onChange={e => handleProfileChange('shopName', e.target.value)}
                placeholder="매장명을 입력하세요"
              />
            </div>
            <div className="sp-form-group">
              <label className="sp-label">주소</label>
              <input
                className="sp-input"
                value={profile.address ?? ''}
                onChange={e => handleProfileChange('address', e.target.value)}
                placeholder="주소를 입력하세요"
              />
            </div>
            <div className="sp-form-group">
              <label className="sp-label">직통 연락처</label>
              <input
                className="sp-input"
                value={profile.phone ?? ''}
                onChange={e => handleProfileChange('phone', e.target.value)}
                placeholder="02-0000-0000"
              />
            </div>
            <div className="sp-form-row">
              <div className="sp-form-group">
                <label className="sp-label">위도</label>
                <input
                  className="sp-input"
                  type="number"
                  step="0.0000001"
                  value={profile.latitude ?? ''}
                  onChange={e => handleProfileChange('latitude', parseFloat(e.target.value))}
                  placeholder="37.5012"
                />
              </div>
              <div className="sp-form-group">
                <label className="sp-label">경도</label>
                <input
                  className="sp-input"
                  type="number"
                  step="0.0000001"
                  value={profile.longitude ?? ''}
                  onChange={e => handleProfileChange('longitude', parseFloat(e.target.value))}
                  placeholder="127.0396"
                />
              </div>
            </div>

            <div className="sp-form-actions">
              {profileSaved && <span className="sp-saved">✓ 저장되었습니다</span>}
              <button className="btn btn--primary" type="submit" disabled={profileLoading}>
                {profileLoading ? '저장 중...' : '저장'}
              </button>
            </div>
          </form>
        </div>

        {/* Operating hours */}
        <div className="card sp-card">
          <h2 className="sp-section-title">운영시간</h2>
          <form onSubmit={saveHours}>
            <div className="sp-hours-grid">
              <div className="sp-hours-header">
                <span>요일</span><span>오픈</span><span>마감</span><span>휴무</span>
              </div>
              {hours.map((row, i) => (
                <div key={i} className={`sp-hours-row${row.isClosed ? ' sp-hours-row--closed' : ''}`}>
                  <span className={`sp-day-label${i===0?' sp-day-label--sun':i===6?' sp-day-label--sat':''}`}>
                    {DAYS_KO[i]}
                  </span>
                  <input
                    type="time"
                    className="sp-time-input"
                    value={row.openTime ?? ''}
                    disabled={row.isClosed}
                    onChange={e => handleHourChange(i, 'openTime', e.target.value)}
                  />
                  <input
                    type="time"
                    className="sp-time-input"
                    value={row.closeTime ?? ''}
                    disabled={row.isClosed}
                    onChange={e => handleHourChange(i, 'closeTime', e.target.value)}
                  />
                  <label className="sp-toggle">
                    <input
                      type="checkbox"
                      checked={row.isClosed}
                      onChange={() => toggleClosed(i)}
                    />
                    <span className="sp-toggle-track" />
                  </label>
                </div>
              ))}
            </div>

            <div className="sp-form-actions">
              {hoursSaved && <span className="sp-saved">✓ 저장되었습니다</span>}
              <button className="btn btn--primary" type="submit" disabled={hoursLoading}>
                {hoursLoading ? '저장 중...' : '저장'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </ShopLayout>
  )
}
