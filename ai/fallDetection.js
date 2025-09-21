// Phát hiện ngã đơn giản dựa trên ngưỡng tổng gia tốc
// totalG > 2.8 coi là ngã (có thể tinh chỉnh)
function detectFall(totalG) {
  if (typeof totalG !== "number") return false;
  return totalG >= 2.8;
}

module.exports = { detectFall };

