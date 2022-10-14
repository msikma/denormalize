[![MIT license](https://img.shields.io/badge/license-MIT-brightgreen.svg)](https://opensource.org/licenses/MIT)

# Denormalize

Library and command line utility for processing and extracting assets for the 3D/ADV engine written by Graeme Ing. This engine was used for the games [Normality](https://www.mobygames.com/game/normality) and [Realms of the Haunting](https://www.mobygames.com/game/dos/realms-of-the-haunting), both by Gremlin Interactive ltd.

**This library is currently under heavy development and doesn't do much yet.**

## Features

This library can extract the following assets:

* Language strings (lines spoken in the game and interface text)
* Sound effects
* Map textures
* Video files (`.gdv` files)
* Static images

Other things such as map geometry are not yet implemented.

## Credits

The work in this library is based on reverse engineering done by Denzquix. He was the first to work out how to decode the `.mgl` compression format and `.das` data files. The initial work was posted on the Salt World Forums in 2012:

* [Unravelling the secrets of "Normality"](https://web.archive.org/web/20221014221459/http://saltworld.net/forums/topic/12496-unravelling-the-secrets-of-normality-1996/) (2012, December 16) - Denzquix, Salt World Forums. [Original.](http://saltworld.net/forums/topic/12496-unravelling-the-secrets-of-normality-1996/)

## License

MIT license.
