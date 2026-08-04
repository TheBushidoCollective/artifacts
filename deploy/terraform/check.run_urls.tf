# The computed hostnames must be the ones Cloud Run actually issued.
#
# Everything downstream is built on them: the CSP frame-src, the sandbox
# iframe's src, the bucket's CORS origin, and the `type` URIs in every problem
# document. A wrong infix would produce a deployment that looks healthy and
# cannot render HTML or fetch ciphertext, so this fails the apply instead.
check "run_urls_match" {
  assert {
    condition     = module.relic.service_url == local.service_url
    error_message = "Computed service URL ${local.service_url} does not match the issued ${module.relic.service_url}. Fix run_url_infix."
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
}
