# <img src="img/logo.svg" alt="logo" height="48px"/> Sun and Moon Datasource Backend

[![Build Status](https://github.com/simonbuehler/sunandmoon_backend/actions/workflows/ci.yml/badge.svg)](https://github.com/simonbuehler/sunandmoon_backend/actions/workflows/ci.yml)
[![Coverage Status](https://coveralls.io/repos/github/simonbuehler/sunandmoon_backend/badge.svg)](https://coveralls.io/github/simonbuehler/sunandmoon_backend)

![Marketplace Version](https://img.shields.io/badge/dynamic/json?logo=grafana&query=$.version&url=https://grafana.com/api/plugins/simonbuehler/sunandmoon_backend&label=Marketplace&prefix=v&color=F47A20)
![Downloads](https://img.shields.io/badge/dynamic/json?logo=grafana&query=$.downloads&url=https://grafana.com/api/plugins/simonbuehler/sunandmoon_backend&label=Downloads&color=blue)

## Overview

The **Sun and Moon Datasource Backend Plugin** for Grafana allows for metrics and events related to the sun and moon, such as solar noon, sunrise, sunset, moonrise, moonset, and more. This Go backend version is a port of the original [Grafana Sun and Moon Datasource](https://github.com/simonbuehler/sunandmoon_backend) using the [Suncalc Go library](https://github.com/sixdouglas/suncalc).

### Why This Plugin?

This backend version was developed to address the limitations of frontend-only plugins, particularly their incompatibility with **public dashboards** in Grafana. By handling the calculations on the backend, this plugin is fully functional for public dashboards, making it ideal for shared or embedded use cases.

## Features

- **Sun Events**: Solar noon, sunrise, sunset, golden hour, and other sun-related events.
- **Moon Events**: Moonrise, moonset, moon illumination, and more.
- **Backend Processing**: Moves the calculations to the backend, ensuring compatibility with public Grafana dashboards.

![Sun and Moon Screenshot](https://raw.githubusercontent.com/fetzerch/grafana-sunandmoon-datasource/master/src/img/screenshot.png)

## Requirements

- **Grafana version**: 10.4.0 and above.

## Getting Started

1. **Add the Sun and Moon Datasource** in Grafana.
2. **Configure the default latitude and longitude** to specify your location.
3. Use the query editor to select metrics or annotations for visualization.

### Example Metrics:

- `moon_illumination`: Percentage of the moon illuminated.
- `sun_altitude`: Sun's height in degrees.
- `moon_distance`: Distance to the moon.

### Example Annotations:

- `sunrise`: When the top edge of the sun appears on the horizon.
- `moonrise`: When the moon appears on the horizon.

## Licensing

This plugin is licensed under the [Apache-2.0 License](https://github.com/simonbuehler/sunandmoon_backend/blob/main/LICENSE).
