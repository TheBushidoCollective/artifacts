locals {
  # Defined once and merged into both services, so the two origins cannot
  # disagree about which is which.
  #
  # They previously did. The sandbox was given the pair swapped, on the reading
  # that each service should describe itself, and the swap silently disabled
  # HTML rendering: the sandbox derives `frame-ancestors` from
  # RELIC_SERVICE_ORIGIN to declare who may embed it, so naming itself refused
  # every embed from the real viewer. Nothing failed loudly. The sandbox still
  # answered 200, Terraform still applied, and only a browser ever objected.
  #
  # These are absolute names for two roles, not relative ones. Keeping the pair
  # in a single place makes "swap them for this one service" an edit that has
  # nowhere to land.
  origin_env = {
    RELIC_SERVICE_ORIGIN = var.service_url
    RELIC_SANDBOX_ORIGIN = var.sandbox_url
  }
}
