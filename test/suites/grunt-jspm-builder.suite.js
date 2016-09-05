const grunt = require('grunt');
const fs = require('fs-extra');
const after = require('mocha').after;
const assert = require('assert');

grunt.task.loadTasks('../tasks');
grunt.task.init = () => {
};

describe('grunt-jspm-builder', () => {
    after(() => {
        fs.removeSync('./build');
    });

    it('should create a single bundle with all dependencies included', done => {
        const outputFile = 'build/js/app.js';
        const inputFile = 'app.js';

        grunt.config.init({
            jspm: {
                monolithicBundle: {
                    options: {
                        sfx: true,
                        minify: false,
                        mangle: false,
                        sourceMaps: false
                    },
                    files: {
                        [outputFile]: inputFile
                    }
                }
            }
        });

        grunt.registerTask('monolithTest', () => {
        });

        grunt.tasks(['monolithTest', 'jspm'], {}, () => {
            fs.readFile(outputFile, 'utf8', (err, data) => {
                assert.ok(data);
                ['EntryPointA', 'EntryPointB', 'LibA', 'LibB', 'ModuleA', 'ModuleB', 'ModuleC'].forEach(dep => {
                    assert.ok(data.includes(`function ${dep}()`));
                });
                done();
            });
        });
    });

    it('should create a single bundle containing only dependencies', done => {
        const outputFile = 'build/js/libs/dependencies.js';

        grunt.config.init({
            jspm: {
                extractDeps: {
                    options: {
                        sfx: false,
                        minify: false,
                        sourceMaps: false,
                        inject: true, // important for jspm projects only
                        mangle: true
                    },

                    files: {
                        [outputFile]: "libs/**/* - [src/**/*]"
                    }
                }
            }
        });

        grunt.registerTask('dependencyTest', () => {
        });

        grunt.tasks(['dependencyTest', 'jspm'], {}, () => {
            fs.readFile(outputFile, 'utf8', (err, data) => {
                assert.ok(data);
                ['LibA', 'LibB'].forEach(dep => {
                    assert.ok(data.includes(`function ${dep}()`));
                });
                ['EntryPointA', 'EntryPointB', 'ModuleA', 'ModuleB', 'ModuleC'].forEach(dep => {
                    assert.ok(!data.includes(`function ${dep}()`));
                });
                done();
            });
        });
    });

    it('should exclude bundles or 3rd party dependencies', done => {
        const outputFile = 'build/js/app.js';
        const inputFile = 'app.js';
        grunt.config.init({
            jspm: {
                excludeBundles: {
                    options: {
                        sfx: false,
                        minify: false,
                        mangle: false,
                        sourceMaps: false
                    },
                    files: {
                        // Exclude all 3rd party dependencies from the build.
                        // This task assumes that build/js/libs/dependencies exists
                        [outputFile]: `${inputFile} - build/js/libs/dependencies`
                    }
                }
            }
        });

        grunt.registerTask('dependencyExclusionTest', () => {
        });

        grunt.tasks(['dependencyExclusionTest', 'jspm'], {}, () => {
            fs.readFile(outputFile, 'utf8', (err, data) => {
                assert.ok(data);
                ['EntryPointA', 'EntryPointB', 'ModuleA', 'ModuleB', 'ModuleC'].forEach(dep => {
                    assert.ok(data.includes(`function ${dep}()`));
                });
                ['LibA', 'LibB'].forEach(dep => {
                    assert.ok(!data.includes(`function ${dep}()`));
                });
                done();
            });
        });
    });

    it('should create a common bundle', done => {
        const outputFile = 'build/js/common.js';
        const entryPointADestination = 'build/js/entryPointA';
        const entryPointBDestination = 'build/js/entryPointB';
        grunt.config.init({
            jspm: {
                commonOption2: {
                    // Options for bundles
                    options: {
                        sfx: false,
                        minify: false,
                        mangle: false,
                        sourceMaps: false
                    },
                    files: {
                        [entryPointADestination]: 'EntryPointA',
                        [entryPointBDestination]: 'EntryPointB'
                    },
                    // The 'commonBundle' Object is required in order
                    // to tell the builder to compare the above source
                    // trees and create a bundle containing common deps.
                    commonBundle: {
                        // options for building the common bundle
                        options: {
                            sfx: false,
                            minify: false,
                            sourceMaps: false,
                            inject: true, // important!
                            mangle: true,
                        },
                        dest: outputFile
                    }
                }
            }
        });

        grunt.registerTask('commonBundleTest', () => {
        });

        grunt.tasks(['commonBundleTest', 'jspm'], {}, () => {
            fs.readFile(outputFile, 'utf8', (err, data) => {
                assert.ok(data);
                ['LibA', 'LibB'].forEach(dep => {
                    assert.ok(data.includes(`function ${dep}()`));
                });
                ['EntryPointA', 'EntryPointB', 'ModuleA', 'ModuleB', 'ModuleC'].forEach(dep => {
                    assert.ok(!data.includes(`function ${dep}()`));
                });
                done();
            });
        });
    });
});
