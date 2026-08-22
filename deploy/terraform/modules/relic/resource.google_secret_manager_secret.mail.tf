# Terraform owns the secret's container and who may read it, and deliberately
# nothing more. The version, the actual Resend API key, is added by a human
# out of band: a version created here would put the key in terraform state
# and in CI, which is exactly what this split exists to avoid.
resource "google_secret_manager_secret" "mail" {
  project   = var.project_id
  secret_id = "relic-resend-api-key"

  replication {
    auto {}
  }
}

# The service revision mounts the key as an env var, which needs the
# accessor role on the app identity and nothing broader.
resource "google_secret_manager_secret_iam_member" "mail_accessor" {
  project   = var.project_id
  secret_id = google_secret_manager_secret.mail.secret_id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.app.email}"
}
