# grunt-jspm-builder

## Install

```
$ npm install --save-dev grunt-jspm-builder
```

## Usage

The grunt-jspm-builder provides all [jspm production workflows](http://jspm.io/docs/production-workflows.html) via *most* [SystemJS APIs](https://github.com/systemjs/builder). 
```js
grunt.loadNpmTasks('grunt-jspm-builder');
```
### Monolithic Bundle
Build a single monolithic bundle including all 3rd party libraries.

```js
grunt.initConfig({
    // ...
	jspm: {
		monolithicBundle: {
            options: {
                sfx: true,
                minify: true,
                mangle: true,
                sourceMaps: false
            },
            files: {
                "build/js/app.js": "src/app.js"
            }
		}
    }
    // ...
});
```

### Extract 3rd party dependencies
Extract all 3rd party dependencies from your project and place them in a separate bundle.

```js
grunt.initConfig({
    // ...
    jspm: {
        extractDeps: {
            options: {
                sfx: false,
                minify: true,
                sourceMaps: false,
                inject: true, // important for jspm projects only
                mangle: true
            },

            files: {
                "build/js/libs/dependencies.js": "js/**/* - [src/**/*]"
            }
        }
    }
    // ...
});
```

### Exclude specific bundles or 3rd party dependencies.
Builds the project excluding the specified bundles or source trees using arithmetic and/or module syntax.

```js
grunt.initConfig({
    // ...
    jspm: {
        excludeBundles: {
            options: {
                sfx: false,
                minify: true,
                mangle: true,
                sourceMaps: false
            },
            files: {
                // Exclude all 3rd party dependencies and mock data from the build.
                // This task assumes that build/js/libs/dependencies exists 
                "build/js/app.js": "js/app - build/js/libs/dependencies - [js/mockData/**/*]"
            }
        }
    }
    // ...
});
```

### Create a Common Bundle
Build the dependencies in common between 2 modules including all project-level and 3rd party dependencies.

```js
grunt.initConfig({
    // ...
    jspm: {
        commonBundle: {
            options: {
                sfx: false,
                minify: true,
                mangle: true,
                sourceMaps: false
                inject: true // important for jspm builds only
            },
            files: {
                "build/js/common.js": "js/modules/module1 & js/modules/module2"
            }
        }
    }
    // ...
});
```

### Bundle Dependencies between 2 or More Source Trees
Compare 2 or more bundles using arithmeic, extract their common dependencies and place them in a separate bundle and then build all the bundles.  

```js
grunt.initConfig({
    // ...
    jspm: {
        commonOption2: {
            // Options for bundles
            options: {
                sfx: false,
                minify: false,
                mangle: false,
                sourceMaps: true
            },
            files: {
                // Exclude core-libs from the comparison
                // since it is it's own bundle.
                "build/modules/module1": "js/modules/module1 - core-libs",
                "build/modules/module2": "js/modules/module1 - core-libs"
            },
            commonBundle: {
                // options for building the common bundle
                options: {
                    sfx: false,
                    minify: false,
                    sourceMaps: false,
                    inject: true, // important!
                    mangle: true
                },
                dest: 'build/js/common.js'
            }
        }
    }
    // ...
});
```

## Options

All available options follow those used on [SystemJS](https://github.com/systemjs/builder) builds.

### `sfx`

Default: `true`

Creates a single self-executing bundle for a module (Not available using bundle arithmetic).


### `minify`

Default: `true`

Use minification, defaults to true.


### `mangle`

Default: `true`

Use mangling with minification, defaults to true

### `sourceMaps`

Default: `false`

include or exclude source maps in the build, defaults to false

## License

MIT © Justin Wilaby
