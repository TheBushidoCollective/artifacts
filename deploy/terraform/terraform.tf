terraform {
  required_version = "~> 1.9"

  # State lives in GCS and is shared with CI. Never run apply from a
  # workstation: it races the pipeline.
  backend "gcs" {
    bucket = "thebushido-co-tfstate"
    prefix = "relic"
  }

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 6.0"
    }
  }
}
