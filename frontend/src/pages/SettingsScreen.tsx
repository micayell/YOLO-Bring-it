import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Moon,
  Sun,
  Volume2,
  VolumeX,
  Globe,
  Gamepad2,
  Palette,
  Bell,
  Shield,
  HelpCircle,
  AlertTriangle,
} from "lucide-react";
import { useTheme } from "@/shared/lib/ThemeContext";
import { useState } from "react";
import { Switch } from "@/shared/ui/switch";
import { Slider } from "@/shared/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { Button } from "@/shared/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import { Separator } from "@/shared/ui/separator";
import { useNavigate } from "react-router-dom";
import { useUserLoginStore } from "@/app/stores/userStore";
import { authService } from "@/shared/services/authService";

interface SettingsScreenProps {
  onBack: () => void;
}

export function SettingsScreen({ onBack }: SettingsScreenProps) {
  const { theme, toggleTheme } = useTheme();
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [musicVolume, setMusicVolume] = useState([75]);
  const [effectVolume, setEffectVolume] = useState([80]);
  const [language, setLanguage] = useState("ko");
  const [notifications, setNotifications] = useState(true);
  const [autoSave, setAutoSave] = useState(true);

  // ===== 회원탈퇴 모달 상태 =====
  const [confirmOpen, setConfirmOpen] = useState(false);   // 1차 확인
  const [confirmOpen2, setConfirmOpen2] = useState(false); // 2차 확인
  const [withdrawing, setWithdrawing] = useState(false);
  const [withdrawError, setWithdrawError] = useState("");

  // 라우팅 & 스토어
  const navigate = useNavigate();
  const { clearUser: clearUserLogin } = useUserLoginStore();

  // 최종 회원탈퇴 실행 (2차 모달에서만 호출)
  const handleWithdraw = async () => {
    try {
      setWithdrawError("");
      setWithdrawing(true);

      await authService.withdraw();

      // 성공 처리 (토큰 제거는 authService에서 처리)
      clearUserLogin();

      setConfirmOpen(false);
      setConfirmOpen2(false);
      navigate("/");
    } catch (e: any) {
      const msg =
        e?.response?.data?.message ??
        e?.message ??
        "회원탈퇴에 실패했습니다. 잠시 뒤 다시 시도해주세요.";
      setWithdrawError(msg);
    } finally {
      setWithdrawing(false);
    }
  };

  return (
    <motion.div
      className="min-h-screen bg-background text-foreground overflow-hidden font-optimized"
      style={{
        maxWidth: "100vw",
        fontSize: "var(--text-base)",
        fontWeight: "var(--font-weight-normal)",
        lineHeight: "1.5",
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* 배경 그라데이션 효과 */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/30 via-transparent to-purple-50/20 dark:from-indigo-950/20 dark:via-transparent dark:to-purple-950/10" />

      {/* 배경 장식 효과 */}
      <motion.div
        className="absolute w-32 h-32 bg-gradient-to-br from-indigo-400/10 to-purple-400/10 rounded-full blur-3xl"
        style={{ top: "var(--spacing-5xl)", left: "var(--spacing-5xl)" }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />

      <div
        className="relative z-10 h-full overflow-y-auto font-optimized"
        style={{ padding: "var(--spacing-lg)", paddingTop: "var(--spacing-2xl)" }}
      >
        {/* 헤더 */}
        <motion.div
          className="flex items-center justify-between mb-8 font-optimized"
          style={{ marginBottom: "var(--spacing-4xl)" }}
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <div className="flex items-center" style={{ gap: "var(--spacing-lg)" }}>
            <motion.button
              className="relative flex items-center bg-card/50 hover:bg-card/70 backdrop-blur-sm border border-border rounded-lg overflow-hidden transition-all duration-300 touch-target game-text"
              style={{
                padding: "var(--spacing-md) var(--spacing-xl)",
                gap: "var(--spacing-sm)",
                fontSize: "clamp(0.875rem, 3vw, 1rem)",
                fontWeight: "var(--font-weight-medium)",
                lineHeight: "1.5",
                minHeight: "var(--touch-target-min)",
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onBack}
            >
              <ArrowLeft style={{ width: "var(--icon-md)", height: "var(--icon-md)" }} />
              <span className="relative z-10">뒤로가기</span>

              <motion.div
                className="absolute top-0 left-0 w-[120%] h-full bg-gradient-to-r from-transparent via-white/15 to-transparent -skew-x-12"
                animate={{ x: ["-120%", "120%"] }}
                transition={{ duration: 3, repeat: Infinity, repeatDelay: 8, ease: "easeInOut" }}
              />
            </motion.button>

            <div className="flex items-center" style={{ gap: "var(--spacing-md)" }}>
              <div className="bg-primary/10 rounded-full flex items-center justify-center" style={{ padding: "var(--spacing-sm)" }}>
                <Gamepad2 className="text-primary" style={{ width: "var(--icon-lg)", height: "var(--icon-lg)" }} />
              </div>
              <div>
                <h1
                  className="game-text text-foreground"
                  style={{ fontSize: "clamp(1.5rem, 5vw, 2.5rem)", fontWeight: "var(--font-weight-medium)", lineHeight: "1.2", letterSpacing: "0.1em" }}
                >
                  ⚙️ 게임 설정
                </h1>
                <p className="text-muted-foreground" style={{ fontSize: "clamp(0.875rem, 3vw, 1rem)" }}>
                  게임 환경을 맞춤 설정하세요
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* 설정 카드들 */}
        <div className="max-w-4xl mx-auto" style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-xl)" }}>
          {/* 화면 설정 */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.6 }}>
            <Card>
              <CardHeader style={{ padding: "var(--spacing-xl)", paddingBottom: "var(--spacing-lg)" }}>
                <CardTitle
                  className="flex items-center game-text"
                  style={{ gap: "var(--spacing-sm)", fontSize: "clamp(1.125rem, 4vw, 1.5rem)", fontWeight: "var(--font-weight-medium)" }}
                >
                  <Palette className="text-primary" style={{ width: "var(--icon-md)", height: "var(--icon-md)" }} />
                  화면 설정
                </CardTitle>
                <CardDescription>테마와 화면 표시 옵션을 설정합니다</CardDescription>
              </CardHeader>
              <CardContent style={{ padding: "0 var(--spacing-xl) var(--spacing-xl)" }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center" style={{ gap: "var(--spacing-md)" }}>
                    {theme === "dark" ? (
                      <Moon className="text-primary" style={{ width: "var(--icon-md)", height: "var(--icon-md)" }} />
                    ) : (
                      <Sun className="text-primary" style={{ width: "var(--icon-md)", height: "var(--icon-md)" }} />
                    )}
                    <div>
                      <p className="text-foreground" style={{ fontWeight: "var(--font-weight-medium)" }}>
                        다크 모드
                      </p>
                      <p className="text-muted-foreground">어두운 테마로 눈의 피로를 줄여보세요</p>
                    </div>
                  </div>
                  <Switch checked={theme === "dark"} onCheckedChange={toggleTheme} />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* 오디오 설정 */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.6 }}>
            <Card>
              <CardHeader style={{ padding: "var(--spacing-xl)", paddingBottom: "var(--spacing-lg)" }}>
                <CardTitle
                  className="flex items-center game-text"
                  style={{ gap: "var(--spacing-sm)", fontSize: "clamp(1.125rem, 4vw, 1.5rem)", fontWeight: "var(--font-weight-medium)" }}
                >
                  <Volume2 className="text-primary" style={{ width: "var(--icon-md)", height: "var(--icon-md)" }} />
                  오디오 설정
                </CardTitle>
                <CardDescription>게임 사운드와 음량을 조절합니다</CardDescription>
              </CardHeader>
              <CardContent
                style={{
                  padding: "0 var(--spacing-xl) var(--spacing-xl)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "var(--spacing-2xl)",
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center" style={{ gap: "var(--spacing-md)" }}>
                    {soundEnabled ? (
                      <Volume2 className="text-primary" style={{ width: "var(--icon-md)", height: "var(--icon-md)" }} />
                    ) : (
                      <VolumeX className="text-muted-foreground" style={{ width: "var(--icon-md)", height: "var(--icon-md)" }} />
                    )}
                    <div>
                      <p className="text-foreground" style={{ fontWeight: "var(--font-weight-medium)" }}>
                        사운드 활성화
                      </p>
                      <p className="text-muted-foreground">게임 사운드를 켜거나 끕니다</p>
                    </div>
                  </div>
                  <Switch checked={soundEnabled} onCheckedChange={setSoundEnabled} />
                </div>

                {soundEnabled && (
                  <div style={{ paddingLeft: "var(--spacing-4xl)", display: "flex", flexDirection: "column", gap: "var(--spacing-lg)" }}>
                    <div>
                      <div className="flex items-center justify-between" style={{ marginBottom: "var(--spacing-sm)" }}>
                        <label className="text-foreground" style={{ fontWeight: "var(--font-weight-medium)" }}>
                          배경음악
                        </label>
                        <span className="text-muted-foreground number-optimized">{musicVolume[0]}%</span>
                      </div>
                      <Slider value={musicVolume} onValueChange={setMusicVolume} max={100} step={5} className="w-full" />
                    </div>

                    <div>
                      <div className="flex items-center justify-between" style={{ marginBottom: "var(--spacing-sm)" }}>
                        <label className="text-foreground" style={{ fontWeight: "var(--font-weight-medium)" }}>
                          효과음
                        </label>
                        <span className="text-muted-foreground number-optimized">{effectVolume[0]}%</span>
                      </div>
                      <Slider value={effectVolume} onValueChange={setEffectVolume} max={100} step={5} className="w-full" />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* 게임 설정 */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.6 }}>
            <Card>
              <CardHeader style={{ padding: "var(--spacing-xl)", paddingBottom: "var(--spacing-lg)" }}>
                <CardTitle
                  className="flex items-center game-text"
                  style={{ gap: "var(--spacing-sm)", fontSize: "clamp(1.125rem, 4vw, 1.5rem)", fontWeight: "var(--font-weight-medium)" }}
                >
                  <Gamepad2 className="text-primary" style={{ width: "var(--icon-md)", height: "var(--icon-md)" }} />
                  게임 설정
                </CardTitle>
                <CardDescription>게임플레이 관련 설정을 조정합니다</CardDescription>
              </CardHeader>
              <CardContent
                style={{ padding: "0 var(--spacing-xl) var(--spacing-xl)", display: "flex", flexDirection: "column", gap: "var(--spacing-lg)" }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center" style={{ gap: "var(--spacing-md)" }}>
                    <Globe className="text-primary" style={{ width: "var(--icon-md)", height: "var(--icon-md)" }} />
                    <div>
                      <p className="text-foreground" style={{ fontWeight: "var(--font-weight-medium)" }}>
                        언어
                      </p>
                      <p className="text-muted-foreground">게임 인터페이스 언어를 선택하세요</p>
                    </div>
                  </div>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger style={{ width: "8rem", minHeight: "var(--touch-target-min)" }}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ko">한국어</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="ja">日本語</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="flex items-center" style={{ gap: "var(--spacing-md)" }}>
                    <Bell className="text-primary" style={{ width: "var(--icon-md)", height: "var(--icon-md)" }} />
                    <div>
                      <p className="text-foreground" style={{ fontWeight: "var(--font-weight-medium)" }}>
                        알림
                      </p>
                      <p className="text-muted-foreground">게임 이벤트 알림을 받습니다</p>
                    </div>
                  </div>
                  <Switch checked={notifications} onCheckedChange={setNotifications} />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center" style={{ gap: "var(--spacing-md)" }}>
                    <Shield className="text-primary" style={{ width: "var(--icon-md)", height: "var(--icon-md)" }} />
                    <div>
                      <p className="text-foreground" style={{ fontWeight: "var(--font-weight-medium)" }}>
                        자동 저장
                      </p>
                      <p className="text-muted-foreground">게임 진행 상황을 자동으로 저장합니다</p>
                    </div>
                  </div>
                  <Switch checked={autoSave} onCheckedChange={setAutoSave} />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* 도움말 및 정보 */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.6 }}>
            <Card>
              <CardHeader style={{ padding: "var(--spacing-xl)", paddingBottom: "var(--spacing-lg)" }}>
                <CardTitle
                  className="flex items-center game-text"
                  style={{ gap: "var(--spacing-sm)", fontSize: "clamp(1.125rem, 4vw, 1.5rem)", fontWeight: "var(--font-weight-medium)" }}
                >
                  <HelpCircle className="text-primary" style={{ width: "var(--icon-md)", height: "var(--icon-md)" }} />
                  도움말 및 정보
                </CardTitle>
              </CardHeader>
              <CardContent
                style={{
                  padding: "0 var(--spacing-xl) var(--spacing-xl)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "var(--spacing-sm)",
                }}
              >
                <Button variant="ghost" className="w-full justify-start touch-target" style={{ padding: "var(--spacing-md) var(--spacing-lg)" }}>
                  게임 튜토리얼
                </Button>
                <Button variant="ghost" className="w-full justify-start touch-target" style={{ padding: "var(--spacing-md) var(--spacing-lg)" }}>
                  키보드 단축키
                </Button>
                <Button variant="ghost" className="w-full justify-start touch-target" style={{ padding: "var(--spacing-md) var(--spacing-lg)" }}>
                  문의하기
                </Button>
                <Button variant="ghost" className="w-full justify-start touch-target" style={{ padding: "var(--spacing-md) var(--spacing-lg)" }}>
                  버전 정보
                </Button>

                {/* ✅ 회원탈퇴 버튼 */}
                <div className="pt-2">
                  <Button
                    variant="outline"
                    onClick={() => setConfirmOpen(true)}
                    className="w-full justify-start border-red-200 text-red-600 hover:text-red-700 hover:bg-red-50"
                    style={{ padding: "var(--spacing-md) var(--spacing-lg)" }}
                  >
                    회원탈퇴
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* 하단 버튼 */}
          <motion.div
            className="flex"
            style={{ gap: "var(--spacing-md)", paddingTop: "var(--spacing-xl)", paddingBottom: "var(--spacing-2xl)" }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
          >
            <Button variant="outline" className="flex-1 touch-target" style={{ padding: "var(--spacing-lg)" }} onClick={onBack}>
              취소
            </Button>
            <Button
              className="flex-1 bg-gradient-to-r from-[#6dc4e8] to-[#5ab4d8] hover:from-[#5ab4d8] hover:to-[#4aa2c8] touch-target"
              style={{ padding: "var(--spacing-lg)" }}
              onClick={onBack}
            >
              설정 저장
            </Button>
          </motion.div>
        </div>
      </div>

      {/* ====== 1차 확인 모달 ====== */}
      <AnimatePresence>
        {confirmOpen && (
          <motion.div
            className="fixed inset-0 z-50 bg-white/50 backdrop-blur-sm flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="w-full max-w-md rounded-2xl border border-border bg-white shadow-xl overflow-hidden"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
            >
              <div className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="rounded-lg bg-red-500/10 p-2">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                  </div>
                  <h3 className="text-lg font-semibold">회원탈퇴</h3>
                </div>

                <p className="text-sm text-muted-foreground leading-6">
                  같은 아이디로 재가입이 <b>불가능</b>합니다. <br />
                  정말 탈퇴하시겠습니까?
                </p>

                <div className="mt-6 flex items-center justify-end gap-2">
                  <Button variant="outline" onClick={() => setConfirmOpen(false)}>
                    취소
                  </Button>
                  <Button
                    className="bg-red-600 hover:bg-red-700 text-white"
                    onClick={() => {
                      setConfirmOpen(false);
                      setConfirmOpen2(true); // 👉 2차 확인 모달로 이동
                    }}
                  >
                    탈퇴
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ====== 2차(최종) 확인 모달 ====== */}
      <AnimatePresence>
        {confirmOpen2 && (
          <motion.div
            className="fixed inset-0 z-50 bg-white/60 backdrop-blur-sm flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="w-full max-w-md rounded-2xl border border-red-300/50 bg-white shadow-2xl overflow-hidden"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
            >
              <div className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="rounded-lg bg-red-600/15 p-2">
                    <AlertTriangle className="w-5 h-5 text-red-700" />
                  </div>
                  <h3 className="text-lg font-semibold text-red-700">최종 확인</h3>
                </div>

                <p className="text-sm leading-6">
                  <b>진짜진짜진짜</b> 탈퇴하시겠습니까?
                </p>

                {withdrawError && <p className="mt-3 text-sm text-red-600">{withdrawError}</p>}

                <div className="mt-6 flex items-center justify-end gap-2">
                  <Button variant="outline" disabled={withdrawing} onClick={() => setConfirmOpen2(false)}>
                    취소
                  </Button>
                  <Button className="bg-red-700 hover:bg-red-800 text-white" onClick={handleWithdraw} disabled={withdrawing}>
                    {withdrawing ? "탈퇴 중..." : "탈퇴"}
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
