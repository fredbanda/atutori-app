terraform {
  required_providers {
    google = { source = "hashicorp/google", version = "~> 5.0" }
  }
  required_version = ">= 1.5.0"
}

provider "google" {
  project = var.gcp_project
  region  = var.gcp_region
}

# google_cloud_run_service
resource "google_cloud_run_v2_service" "app" {
  name     = var.app_name
  location = var.gcp_region
  template {
    containers {
      image = var.container_image
      ports { container_port = var.app_port }
      env { name = "ENV" value = var.environment }
    }
  }
}
resource "google_cloud_run_v2_service_iam_member" "public" {
  name     = google_cloud_run_v2_service.app.name
  location = google_cloud_run_v2_service.app.location
  role     = "roles/run.invoker"
  member   = "allUsers"
}

# google_sql_database_instance
resource "google_sql_database_instance" "main" {
  name             = "${var.app_name}-db"
  database_version = "POSTGRES_15"
  region           = var.gcp_region
  settings {
    tier = "db-f1-micro"
    backup_configuration { enabled = true }
  }
  deletion_protection = false
}