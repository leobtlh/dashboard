const gulp = require("gulp")
const zip = require("gulp-zip")
const sass = require("gulp-sass")(require("sass"))
const browserSync = require("browser-sync").create()

gulp.task("sass", function() {
    return gulp.src("./scss/*.scss")
        .pipe(sass())
        .pipe(gulp.dest("../assets/css"))
})

gulp.task("dev", function() {
    gulp.series("sass")()
    browserSync.init({
        server: "../"
    })
    gulp.watch("./scss/*.scss", gulp.series("sass"))
    gulp.watch(["../*.html", "../assets/js/*.js"]).on("change", browserSync.reload)
})

gulp.task("zip", function() {
    return gulp.src(["../assets/**/*", "../index.html", "../index-en.html", "../robots.txt"], {base: "../"})
        .pipe(zip("release.zip"))
        .pipe(gulp.dest("../"))
})

gulp.task("build", function(cb) {
    gulp.series(["sass", "zip"])()
    cb()
})
