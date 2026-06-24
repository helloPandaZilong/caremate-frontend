import apiClient from './client'

export function getGuides() {
    return apiClient.get('/shop/guides')
}

export function getGuideConfirmations() {
    return apiClient.get('/shop/guides/confirmations')
}

export function getGuideDocument(guideType) {
    return apiClient.get(`/shop/guides/${guideType}`)
}

export function getGuideQuiz(guideType) {
    return apiClient.get(`/shop/guides/${guideType}/quiz`)
}

export function submitQuiz(guideType, answers) {
    return apiClient.post(`/shop/guides/${guideType}/quiz/submit`, { answers })
}