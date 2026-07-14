import { apiClient } from './client'

export type DashboardSummary = {
  storeId: number
  businessDate: string
  timeZone: string
  currency: string
  totalSalesAmount: number
  orderCount: number
  totalVisitors: number
  generatedAt: string
}

export type HourlySalesBucket = {
  hour: number
  salesAmount: number
  quantity: number
  orderCount: number
}

export type HourlySales = {
  storeId: number
  businessDate: string
  timeZone: string
  currency: string
  totalSalesAmount: number
  totalQuantity: number
  orderCount: number
  hourly: HourlySalesBucket[]
}

export type HourlyVisitorsBucket = {
  hour: number
  visitorCount: number
}

export type HourlyVisitors = {
  storeId: number
  businessDate: string
  timeZone: string
  totalVisitors: number
  hourly: HourlyVisitorsBucket[]
}

export type ClosingSalesForecast = {
  storeId: number
  businessDate: string
  currency: string
  observedSalesAmount: number
  forecastClosingSalesAmount: number
  generatedAt: string
}

export type TomorrowVisitorsForecast = {
  storeId: number
  targetDate: string
  expectedVisitors: number
  generatedAt: string
}

export function getDashboardSummary(storeId: number) {
  return apiClient
    .get<DashboardSummary>(`/stores/${storeId}/dashboard/summary`)
    .then((res) => res.data)
}

export function getHourlySales(storeId: number) {
  return apiClient
    .get<HourlySales>(`/stores/${storeId}/dashboard/hourly-sales`)
    .then((res) => res.data)
}

export function getHourlyVisitors(storeId: number) {
  return apiClient
    .get<HourlyVisitors>(`/stores/${storeId}/dashboard/hourly-visitors`)
    .then((res) => res.data)
}

export function getClosingSalesForecast(storeId: number) {
  return apiClient
    .get<ClosingSalesForecast>(`/stores/${storeId}/dashboard/closing-sales-forecast`)
    .then((res) => res.data)
}

export function getTomorrowVisitorsForecast(storeId: number) {
  return apiClient
    .get<TomorrowVisitorsForecast>(`/stores/${storeId}/dashboard/tomorrow-visitors-forecast`)
    .then((res) => res.data)
}
