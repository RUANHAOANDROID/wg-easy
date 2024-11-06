# As a workaround we have to build on nodejs 18
# 由于某些问题，我们必须在 nodejs 18 上构建
# nodejs 20 hangs on build with armv6/armv7
#  在 armv6/armv7 架构上，nodejs 20 在构建时会挂起
FROM docker.io/library/node:18-alpine AS build_node_modules

# Update npm to latest 更新 npm 到最新版本
RUN npm install -g npm@latest

# Copy Web UI
# 复制 Web UI 代码
COPY src /app
WORKDIR /app
RUN npm ci --omit=dev &&\
    mv node_modules /node_modules

# Copy build result to a new image.
# 将构建结果复制到新的镜像中。
# This saves a lot of disk space.
# 这可以节省大量的磁盘空间。
FROM docker.io/library/node:lts-alpine
HEALTHCHECK CMD /usr/bin/timeout 5s /bin/sh -c "/usr/bin/wg show | /bin/grep -q interface || exit 1" --interval=1m --timeout=5s --retries=3
COPY --from=build_node_modules /app /app

# Move node_modules one directory up, so during development
# 将 node_modules 目录上移一级，以便在开发过程中
# we don't have to mount it in a volume.
# 无需将其挂载到卷中。
# This results in much faster reloading!
# 这将显著加快重载速度！
#
# Also, some node_modules might be native, and
# the architecture & OS of your development machine might differ
# than what runs inside of docker.
# 此外，某些 node_modules 可能是本地的，
# 而开发机器的架构和操作系统可能与 Docker 内部运行的不同。
COPY --from=build_node_modules /node_modules /node_modules

# Copy the needed wg-password scripts
# 复制所需的 wg-password 脚本
COPY --from=build_node_modules /app/wgpw.sh /bin/wgpw
RUN chmod +x /bin/wgpw

# Install Linux packages 安装 Linux 软件包
RUN apk add --no-cache \
    dpkg \
    dumb-init \
    iptables \
    iptables-legacy \
    wireguard-tools

# Use iptables-legacy  使用 iptables-legacy
RUN update-alternatives --install /sbin/iptables iptables /sbin/iptables-legacy 10 --slave /sbin/iptables-restore iptables-restore /sbin/iptables-legacy-restore --slave /sbin/iptables-save iptables-save /sbin/iptables-legacy-save

# Set Environment  设置环境变量
ENV DEBUG=Server,WireGuard

# Run Web UI  运行 Web UI
WORKDIR /app
CMD ["/usr/bin/dumb-init", "node", "server.js"]
