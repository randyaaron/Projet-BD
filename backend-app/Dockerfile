FROM php:8.3-cli

RUN apt-get update && apt-get install -y \
    curl zip unzip git \
    && docker-php-ext-install pdo pdo_mysql \
    && curl -sS https://getcomposer.org/installer | php \
    && mv composer.phar /usr/local/bin/composer

WORKDIR /app

COPY backend-app/ .

RUN composer install --no-dev --optimize-autoloader

EXPOSE 10000

CMD php artisan db:wipe --table=sanctions --force ; php artisan migrate --force && php artisan serve --host=0.0.0.0 --port=10000
