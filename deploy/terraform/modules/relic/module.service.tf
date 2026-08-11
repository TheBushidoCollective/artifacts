# The service origin: the API, the PWA shell, the abuse form, and the
# published disclosure.
module "service" {
  source = "../cloud-run-service"

  project_id            = var.project_id
  region                = var.region
  name                  = var.service_name
  image                 = var.image
  service_account_email = google_service_account.app.email

  env = merge(local.origin_env, {
    NODE_ENV = "production"

    RELIC_GCS_BUCKET   = var.bucket_name
    RELIC_GCS_PREFIX   = local.ciphertext_prefix
    RELIC_STORE_PREFIX = local.store_prefix

    # No RELIC_GCS_CLIENT_EMAIL or RELIC_GCS_PRIVATE_KEY. Their absence is
    # what selects the metadata signer, so V4 signatures come from the IAM
    # Credentials API using the attached identity and no key material exists
    # in the deployment.

    RELIC_KILL_SWITCH     = tostring(var.kill_switch_engaged)
    RELIC_OPERATOR_TOKENS = var.operator_tokens
  })
}

# Both origins run the same image. The isolation is the origin boundary, not a
# different binary: *.run.app is a Public Suffix List wildcard, so a.run.app is
# the public suffix and each service URL is its own registrable domain.
# Untrusted HTML rendered on the sandbox therefore cannot reach the service
# origin, which is the one holding the fragment.
module "sandbox" {
  source = "../cloud-run-service"

  project_id            = var.project_id
  region                = var.region
  name                  = var.sandbox_name
  image                 = var.image
  service_account_email = google_service_account.app.email

  # The sandbox serves two static files. It is given a bucket so the shared
  # image boots identically, but it never mints, never reads an object, and
  # never sees a key: nothing routes to those paths on this host.
  #
  # Same origin pair as the service, from the same local. See locals.tf for why
  # that is not an oversight.
  env = merge(local.origin_env, {
    NODE_ENV = "production"

    RELIC_GCS_BUCKET = var.bucket_name
    RELIC_GCS_PREFIX = local.ciphertext_prefix
  })

  max_instances = 2
  memory        = "256Mi"
}
