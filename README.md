How host the postgres server:
1. download this file: https://drive.google.com/file/d/1TmHIJ4m38X47kzKH5QoCyIFJkAwnzL0g/view?usp=sharing
2. install docker runtime, this can vary depending on OS
3. run: `docker load -i [file name]`
4. start as need on machine, I prefer the desktop UI
   - `docker run --hostname=4f03e2e814fe --env=POSTGRES_PASSWORD=admin --env=PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/usr/lib/postgresql/17/bin --env=GOSU_VERSION=1.17 --env=LANG=en_US.utf8 --env=PG_MAJOR=17 --env=PG_VERSION=17.4-1.pgdg120+2 --env=PGDATA=/var/lib/postgresql/data --volume=/var/lib/postgresql/data --network=bridge -p 5432:5432 --restart=no --runtime=runc -d postgres`
