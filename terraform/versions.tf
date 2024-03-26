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

terraform {
  required_version = "~> 1.3"

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "5.13.0"
    }
    google-beta = {
      source  = "hashicorp/google-beta"
      version = "5.13.0"
    }
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
  zone    = var.zone

  default_labels = {
    environment = "production"
    team        = "nasa"
    department  = "network-ad-filtering-solution"
    component   = "nasapp"
  }
}

provider "google-beta" {
  project = var.project_id
  region  = var.region
  zone    = var.zone

  default_labels = {
    environment = "production"
    team        = "nasa"
    department  = "network-ad-filtering-solution"
    component   = "nasapp"
  }
}
