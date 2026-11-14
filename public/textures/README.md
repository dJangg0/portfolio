# Earth textures

These locally served textures come from the official three.js example assets:

| Local file | Source | Dimensions | Processing |
| --- | --- | --- | --- |
| `earth-day.jpg` | [earth_atmos_2048.jpg](https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg) | 2048 × 1024 | Original JPEG |
| `earth-night.jpg` | [earth_lights_2048.png](https://threejs.org/examples/textures/planets/earth_lights_2048.png) | 2048 × 1024 | JPEG encoding at quality 86 |
| `earth-clouds.jpg` | [earth_clouds_1024.png](https://threejs.org/examples/textures/planets/earth_clouds_1024.png) | 1024 × 512 | Original transparency converted to a grayscale opacity mask; JPEG quality 88 |

Source repository: [mrdoob/three.js example textures](https://github.com/mrdoob/three.js/tree/dev/examples/textures/planets).
The source repository's MIT license and copyright notice are included in `LICENSE.threejs.txt`.

`earth-clouds.jpg` is an opacity mask: white means cloud, black means clear sky. Sample a color channel as alpha, rather than drawing it as an opaque color map.

These are static illustrative textures, not current satellite observations. No assets were taken from watched.earth.
