output "service_url" { value = google_cloud_run_v2_service.app.uri }
output "db_connection" { value = google_sql_database_instance.main.connection_name }