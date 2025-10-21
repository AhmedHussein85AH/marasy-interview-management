// Utility to reset/clear all stored data
export const resetStoredData = () => {
  localStorage.removeItem('interview-management-storage')
  console.log('Stored data cleared')
}

// Force refresh the page to reload with fresh data
export const forceRefresh = () => {
  window.location.reload()
}
