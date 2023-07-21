# Hostelworld On Roids

## Introduction

Hostelworld on Roids (H.O.R) is a browser extension designed to enhance your experience while searching and selecting
hostels.

It eliminates obstructions from featured/promoted properties and unlocks hidden native features on hostelworld, such as
displaying social cues per property and searched cities. Moreover, it lists some properties which may be unavailable due
to scheduling conflicts, but would have been more ideal if your travel dates were more flexible.

In addition, the extension provides extra metrics by analyzing the availability and reviews per property, presenting 
this data directly on the property card. This might help facilitating your decision-making process when selecting a
hostel.

H.O.R was developed as a personal side project to simplify the process of selecting the "best" hostel from an extensive
range of good ones. It proved & continues to prove useful during my travels, assisting me in finding the most suitable
place to stay depending on my mood, whether I was looking for some busy or more quiet place to stay at. :)


## Supported platforms

Currently, the extension is developed to run on **Chrome version 88** and newer versions. While it is likely to function
on other browsers, it has not been officially tested and confirmed yet.

This section will be updated when additional browsers are supported.


## Development & Building 

Apart from the obvious [git](https://git-scm.com/) one :), you'll need [node.js](https://nodejs.org) and
[yarn](https://yarnpkg.com/getting-started/install/) (utilize corepack magic, so you don't have to install that one)".

The required versions of nodejs & yarn needed can be found at the [engines section](/package.json#L4-L6) of the 
`package.json`.

Simply:
* Use `git` to clone the project.
* Navigate to project's root folder.
* Run `corepack enable` in that folder.
* Run `yarn` in that folder.
* Once completed, run `yarn watch` to build it.

Once build, head over to your Chrome browser and:
* Navigate to `Menu → More tools → Extensions` and enable `Developer Mode`.
* Click on `Load unpacked extension` and select the `/dist` folder.

Congratulations, the extension should now be installed in your browser! Please note that in some cases, you may need to
`reload` the extension for the changes to take effect.

Additional `build` & `lint` commands can be found at the [scripts section](/package.json#L9-L16) of the `package.json`.


## Contributing

Contributions are more than welcome! Feel free to open a PR to introduce new features or fix any existing issues.

Please adhere to the software practices & principles to the best of your knowledge, try to align with the coding
style of the project to minimize cognitive load for reviewers/readers, and don't forget to run `yarn lint` before 
opening a PR. :)


___
_Disclaimer: Hostelworld On Roids is developed independently and is not officially endorsed by or affiliated with
Hostelworld._
