sudo nano /etc/sysctl.conf

sysctl vm.overcommit_memory=1 

sudo sysctl -p

# needed for redis https://redis.io/docs/latest/operate/oss_and_stack/management/admin/#:~:text=overcommit_memory https://medium.com/@akhshyganesh/redis-enabling-memory-overcommit-is-a-crucial-configuration-68dbb77dae5f

