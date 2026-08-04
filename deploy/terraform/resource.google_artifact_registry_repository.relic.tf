resource "google_artifact_registry_repository" "relic" {
  project       = var.project_id
  location      = var.region
  repository_id = "relic"
  description   = "Relic server images."
  format        = "DOCKER"

  # Keep the last few digests so a rollback has something to roll back to,
  # without paying to store every build ever made.
  cleanup_policies {
    id     = "keep-recent"
    action = "KEEP"
    most_recent_versions {
      keep_count = 10
    }
  }

  depends_on = [google_project_service.relic]
}
