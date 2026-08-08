resource "google_service_account" "app" {
  project      = var.project_id
  account_id   = "relic-app"
  display_name = "Relic app server"
  description  = "Runs both Relic origins. Signs GCS URLs through signBlob."
}

# Signing its own blobs. This is what removes the downloaded key from the
# deployment entirely: the signing capability is an IAM role on the identity
# rather than a file with no expiry.
#
# AIDEV-NOTE: the member and the service account are the same principal on
# purpose. signBlob is called for `app` by `app`.
resource "google_service_account_iam_member" "app_token_creator" {
  service_account_id = google_service_account.app.name
  role               = "roles/iam.serviceAccountTokenCreator"
  member             = "serviceAccount:${google_service_account.app.email}"
}
