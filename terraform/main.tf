# Copyright (c) 2024-present eyeo GmbH
#
# This module is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with this program.  If not, see <http://www.gnu.org/licenses/>.

module "runner" {
  #checkov:skip=CKV_TF_1
  source       = "gitlab.com/eyeo/terraform-gitlab-runner-test/google"
  version      = "2.1.0-790ffd7d"
  project_id   = var.project_id
  zone         = var.zone
  region       = var.region
  runner_token = var.runner_token
  custom_gitlab_runner_config = {
    gitlab_runner_version              = "16.9.1-1"
    gitlab_worker_disk_size            = "40"
    gitlab_worker_instance_type        = "n2-standard-8"
  }
}
