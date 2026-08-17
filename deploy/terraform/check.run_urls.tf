# The computed hostnames must be the ones Cloud Run actually issued.
#
# Everything downstream is built on them: the CSP frame-src, the sandbox
# iframe's src, the bucket's CORS origin, and the `type` URIs in every problem
# document. A wrong infix would produce a deployment that looks healthy and
# cannot render HTML or fetch ciphertext, so this fails the apply instead.
check "run_urls_match" {
  assert {
    condition     = module.relic.service_run_url == local.service_run_url
    error_message = "Computed service host ${local.service_run_url} does not match the issued ${module.relic.service_run_url}. Fix run_url_infix."
  }

  assert {
    condition     = module.relic.sandbox_url == local.sandbox_url
    error_message = "Computed sandbox URL ${local.sandbox_url} does not match the issued ${module.relic.sandbox_url}. Fix run_url_infix."
  }

  # The whole point of two services is two registrable domains. If these ever
  # collapse to one host, untrusted HTML would execute somewhere that can read
  # the fragment.
  assert {
    condition     = local.service_url != local.sandbox_url
    error_message = "The service and sandbox origins must be distinct hosts."
  }

  # Distinct hosts is not enough once the service has a real domain. A sandbox
  # host under the service domain would share its registrable domain, so the
  # two origins would stop being cross-site however different the hostnames
  # look. Creating the zone is what made this expressible, so it is asserted
  # rather than left to a comment.
  assert {
    condition     = !endswith(replace(local.sandbox_url, "https://", ""), ".${var.service_domain}")
    error_message = "The sandbox must never resolve beneath ${var.service_domain}: untrusted HTML would share a registrable domain with the service."
  }
}
