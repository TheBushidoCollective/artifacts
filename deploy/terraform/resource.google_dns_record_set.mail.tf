# The Resend mail authentication records for the service domain.
#
# Resend issues these per account, so they are literals: nothing here is
# derived, and moving to a different Resend account means new records, not a
# new formula. Unlike the apex A/AAAA records, which keep a short TTL so a
# moved origin corrects fast, these are authentication records that should
# never move, and a resolver caching them for an hour costs nothing.
resource "google_dns_record_set" "mail_dkim" {
  project      = var.project_id
  managed_zone = google_dns_managed_zone.service.name
  name         = "resend._domainkey.${google_dns_managed_zone.service.dns_name}"
  type         = "TXT"
  ttl          = 3600

  # Cloud DNS TXT rrdatas carry their own quoting, so the value is wrapped in
  # escaped double quotes. The data is the key alone, with no v= or k= prefix.
  rrdatas = ["\"p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCed07i/GlAJ0bnEsvJfnhRyQ/5Umyvn2Z99yoKHQpH29ryb0QAhT0w+LG1brl91L1BQUbHgfdY+t4cBs0j0prUzpPAdcjjO8PEo9QjjqCPlCh8/zfnagBUvmYyQRyOegJ7BpVU0BLHCZaVZDwqz7cfsRYl+wZBigjtVz8qa9Q6PwIDAQAB\""]
}

resource "google_dns_record_set" "mail_rsend" {
  project      = var.project_id
  managed_zone = google_dns_managed_zone.service.name
  name         = "rsend.${google_dns_managed_zone.service.dns_name}"
  type         = "CNAME"
  ttl          = 3600
  rrdatas      = ["rsend.forge.rmta.net."]
}

resource "google_dns_record_set" "mail_send" {
  project      = var.project_id
  managed_zone = google_dns_managed_zone.service.name
  name         = "send.${google_dns_managed_zone.service.dns_name}"
  type         = "CNAME"
  ttl          = 3600
  rrdatas      = ["send.forge.rmta.net."]
}
