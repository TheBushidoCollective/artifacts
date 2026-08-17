# The apex records that make the domain resolve to the load balancer.
#
# Short TTL on purpose. These point at reserved addresses that should not move,
# but if they ever have to, a five minute TTL is the difference between a
# quick correction and a day of stale answers on a domain whose whole value is
# that shared links keep working.
resource "google_dns_record_set" "service_a" {
  project      = var.project_id
  managed_zone = google_dns_managed_zone.service.name
  name         = google_dns_managed_zone.service.dns_name
  type         = "A"
  ttl          = 300
  rrdatas      = [google_compute_global_address.service_ipv4.address]
}

resource "google_dns_record_set" "service_aaaa" {
  project      = var.project_id
  managed_zone = google_dns_managed_zone.service.name
  name         = google_dns_managed_zone.service.dns_name
  type         = "AAAA"
  ttl          = 300
  rrdatas      = [google_compute_global_address.service_ipv6.address]
}
