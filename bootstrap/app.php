<?php

use App\Http\Middleware\HandleAppearance;
use App\Http\Middleware\HandleInertiaRequests;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;
use Spatie\Permission\Exceptions\UnauthorizedException;
use Symfony\Component\HttpFoundation\Response;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
        api: __DIR__ . '/../routes/api.php',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->encryptCookies(except: ['appearance', 'sidebar_state']);
        $middleware->statefulApi();

        $middleware->web(append: [
            HandleAppearance::class,
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
        ]);

        $middleware->alias([
            'role' => \Spatie\Permission\Middleware\RoleMiddleware::class,
            'permission' => \Spatie\Permission\Middleware\PermissionMiddleware::class,
            'role_or_permission' => \Spatie\Permission\Middleware\RoleOrPermissionMiddleware::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
           $exceptions->render(function (UnauthorizedException $e, $request) {
               return inertia('forbidden/index', ['exception' => $e]);
            });

            $exceptions->renderable(function (AuthenticationException $e, $request) {
                if ($request->is('api/*') || $request->expectsJson()) {
                    return response()->json([
                        'message' => 'Unauthenticated.',
                    ], Response::HTTP_UNAUTHORIZED);
                }

                return redirect()->guest(route('login'));
            });

            $exceptions->renderable(function (Throwable $e, $request) {
                if ($request->is('api/*')) {
                    return response()->json([
                        'error' => $e->getMessage(),
                        'type' => class_basename($e),
                    ], method_exists($e, 'getStatusCode') ? $e->getStatusCode() : 500);
                }
            });
    })->create();
