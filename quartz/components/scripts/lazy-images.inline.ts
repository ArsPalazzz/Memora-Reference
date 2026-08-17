const enableLazyImages = () => {
  document.querySelectorAll("article img:not([loading])").forEach((img) => {
    img.loading = "lazy"
    img.decoding = "async"
  })
}

document.addEventListener("DOMContentLoaded", enableLazyImages)
document.addEventListener("nav", enableLazyImages)
