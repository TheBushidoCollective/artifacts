output "url" {
  description = "The service's https URL."
  value       = google_cloud_run_v2_service.service.uri
}

output "name" {
  description = "The service name."
  value       = google_cloud_run_v2_service.service.name
}
