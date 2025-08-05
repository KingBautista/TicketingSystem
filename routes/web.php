<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "web" middleware group. Make something great!
|
*/

Route::get('/', function () { return view('welcome'); });
Route::get('/check-shell-exec', function () {
    if (function_exists('shell_exec')) {
        try {
            $output = shell_exec('echo Shell exec works');
            return 'shell_exec is enabled. Output: ' . $output;
        } catch (\Throwable $e) {
            return 'shell_exec exists but is restricted: ' . $e->getMessage();
        }
    } else {
        return 'shell_exec function does not exist or is disabled in php.ini';
    }
});

