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

variable "project_id" {
  description = "The ID of the project in which the resource belongs"
  type        = string
  default     = "eyeo-pet-tooling"
}

variable "region" {
  description = "The region to deploy the resources"
  type        = string
  default     = "europe-west3"
}

variable "zone" {
  description = "The GCP zone of the runner instance"
  type        = string
  default     = "europe-west3-a"
}

variable "runner_token" {
  description = "The secret key id of the runner registration token obtained from gitlab"
  type        = string
  sensitive   = true
}
