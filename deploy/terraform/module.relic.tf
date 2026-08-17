module "relic" {
  source = "./modules/relic"

  project_id  = var.project_id
  region      = var.region
  image       = var.image
  bucket_name = local.bucket_name

  service_name     = local.service_name
  usercontent_name = local.usercontent_name
  service_url      = local.service_url
  usercontent_url  = local.usercontent_url

  soft_delete_retention_days = var.soft_delete_retention_days
  kill_switch_engaged        = var.kill_switch_engaged
  operator_tokens            = var.operator_tokens

  depends_on = [google_project_service.relic]
}
