#!/bin/bash

until docker exec $DB_CONTAINER pg_isready -U $DB_USER; do
    echo "DB is not ready yet..."
    sleep 5;
done
