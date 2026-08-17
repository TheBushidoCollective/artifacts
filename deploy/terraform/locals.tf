locals {
  bucket_name = "${var.project_id}-relics"

  service_name     = "relic"
  usercontent_name = "relic-usercontent"

  # Computed rather than read back from the resources, because every one of
  # these values is needed before the thing that owns it exists: the service
  # needs the content origin for its CSP and its iframe, the bucket needs
  # the service's origin for CORS, and the service needs its own for the
  # absolute URLs in its problem documents. The `check` block in
  # check.run_urls.tf is what keeps the computation honest.

  # What the service advertises and what a recipient sees. Traffic reaches
  # Cloud Run through the load balancer, so this is the owned domain rather
  # than the host Cloud Run issued.
  service_url = "https://${var.service_domain}"

  # The host Cloud Run actually issued for the service. Never advertised: it
  # is what the check asserts the deployment against. The serverless NEG
  # fronts the service by name, not by URL, so nothing routes on this.
  #
  # It stays reachable, and after the domain cutover it is not a working
  # origin: the bucket's CORS list and the usercontent origin's
  # frame-ancestors both name the domain above, so a relic opened on this
  # host cannot fetch ciphertext and cannot render HTML.
  service_run_url = "https://${local.service_name}-${var.run_url_infix}.a.run.app"

  # The content origin keeps its Cloud Run host, and that is a real
  # registrable domain rather than a shortcut: *.run.app is a Public Suffix
  # List wildcard, so this host is its own eTLD+1 and is cross-origin with
  # the service domain. Moving it under the service domain would collapse
  # the boundary that keeps untrusted HTML away from the fragment.
  # check.run_urls.tf asserts that it never does.
  usercontent_url = "https://${local.usercontent_name}-${var.run_url_infix}.a.run.app"
}
