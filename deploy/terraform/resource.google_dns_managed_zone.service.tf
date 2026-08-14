# The service domain is delegated here before any traffic is routed to it.
# The untrusted rendering sandbox requires its own registrable domain and must
# never be added beneath this zone.
resource "google_dns_managed_zone" "service" {
  project     = var.project_id
  name        = replace(var.service_domain, ".", "-")
  dns_name    = "${var.service_domain}."
  description = "Authoritative public zone for the Relik service domain."
  visibility  = "public"

  dnssec_config {
    state         = "on"
    non_existence = "nsec3"
  }

  # Losing the authoritative zone would break every previously shared link.
  # A domain migration adds another zone; it never replaces this one in place.
  lifecycle {
    prevent_destroy = true
  }

  depends_on = [google_project_service.relic]
}

data "google_dns_keys" "service" {
  project      = var.project_id
  managed_zone = google_dns_managed_zone.service.id
}
