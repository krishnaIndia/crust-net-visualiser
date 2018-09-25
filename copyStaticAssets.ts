import * as shell from "shelljs";

shell.cp("-R", "src/public/scripts", "dist/public/scripts");
shell.cp("-R", "src/public/img", "dist/public/img");
shell.cp("-R", "src/public/css", "dist/public/css");
shell.cp("-R", "src/public/styles", "dist/public/styles");
shell.cp("-R", "src/public/*.html", "dist/public/");
