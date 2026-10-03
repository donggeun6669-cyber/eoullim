# 어울림 발표 PPT (v3 · 한국 친구 반영) 만들기.
#
#   python3 promo/tools/build-deck.py <출력 폴더>            → 어울림_발표.pptx (9장, 약 3분 30초)
#   python3 promo/tools/build-deck.py <출력 폴더> --five     → 어울림_발표_5분.pptx (10장, 홍보 영상 50초 포함 4분 45초)
#                                                              + 어울림_발표대본_5분.md / .html (시간 표시 대본)
#
# 화면 이미지는 promo/assets/screens (capture-screens.mjs 가 찍은 실제 앱 화면).
# 결과: <출력 폴더>/어울림_발표.pptx  — PDF는 LibreOffice(soffice)로 변환한다.
# 숫자는 전부 server/logic.js 의 RULES 와 같다 (수수료 15% · 무료 취소 2일 전 · 한국 친구 그룹당 2명 · 멘토 몫 30% …).
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter
from pptx import Presentation
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE
from pptx.enum.text import MSO_ANCHOR, PP_ALIGN
from pptx.util import Emu, Inches, Pt

ROOT = Path(__file__).resolve().parent.parent
SHOTS = ROOT / 'assets/screens'
ARGS = [a for a in sys.argv[1:] if not a.startswith('--')]
FIVE = '--five' in sys.argv
OUT = Path(ARGS[0] if ARGS else ROOT / 'out')
VIDEO = ROOT / 'out/어울림_홍보_50초_1080p_사운드.mp4'

# 5분판 대본 — (시간, 장 제목, 말할 것). 원래 9장 순서 그대로, 영상 장은 따로.
# 말 빠르기는 1초에 4~5음절로 잡았다. 합계 4:45 (15초 여유).
FIVE_SCRIPT = [
    ('0:00–0:20', '표지', '안녕하세요, 2gether 팀의 김다미입니다. 저희가 만든 서비스는 어울림입니다. 한국에 온 외국인 유학생에게 같은 나라 친구들과 한국인 멘토로 이루어진 「우리 조」를 만들어 주는 캠퍼스 커뮤니티입니다.'),
    ('0:20–1:00', '정착 문제', '학령인구가 줄면서 대학은 유학생으로 빈자리를 채우고 있습니다. 그런데 데려오는 것만큼 중요한 게 정착입니다. 교환학생은 SG MAPLE 버디로 잘 적응하지만, 글로벌 버디는 신입생만 대상이라 2학년 이상, 편입생, 대학원생은 기댈 곳이 없습니다. 그래서 저희는 1:1이 아니라, 한 학기 내내 이어지는 그룹을 만들었습니다. 먼저 50초 영상으로 보시겠습니다.'),
    ('1:52–2:20', '우리 조', '핵심은 우리 조입니다. 학교와 나라, 언어만 고르면 같은 나라 친구 3~4명과 한국인 멘토 1명이 있는 그룹에 자동으로 들어갑니다. 가입도 없고, 한 학기 내내 무료입니다. 매주 그룹 미션으로 처음의 어색함도 같이 깹니다.'),
    ('2:20–2:50', '한국 친구 · 번역', '멘토링에서 「그 나라에 관심 있는 한국 학생은 어떻게 들어오나요?」라는 질문을 받고 이 기능을 넣었습니다. 한국 학생은 관심 있는 나라를 고르면 그 나라 조에 「한국 친구」로 들어갑니다. 조마다 두 명까지입니다. 채팅은 어떤 언어로 써도 각자 자기 언어로 자동 번역됩니다.'),
    ('2:50–3:20', '이벤트', '그룹은 무료이고, 수익은 이벤트에서 냅니다. 사주 카페나 한복 산책처럼 한국에서만 할 수 있는 체험, 필리핀 Undas 같은 나라별 명절, 그룹 대항 체육대회를 엽니다. 참가비의 15%가 수수료입니다. 2일 전까지 무료 취소, 최소 인원이 안 모이면 자동으로 전액 환불됩니다.'),
    ('3:20–3:40', '커뮤니티', '그룹 밖의 가벼운 도움은 커뮤니티 게시판 하나에서 해결합니다. 질문을 쓰면 성대 공식 안내부터 먼저 보여 줍니다. 포인트는 선택이고, 72시간 동안 답이 없으면 환불됩니다.'),
    ('3:40–4:05', '수익 구조', '정리하면, 그룹은 무료, 이벤트 수수료가 메인, 포인트가 보조 수익입니다. 어울림 수익의 30%는 한국인 멘토가 실적대로 받습니다. 한국 학생에게는 캠퍼스 일자리가 되고, 멘토가 계속 조를 돌볼 이유가 생깁니다.'),
    ('4:05–4:30', '개인정보 · 다음 단계', '가입도 로그인도 없고, 이름이나 학번, 연락처를 받지 않습니다. 번역도 유료 AI 없이 동작합니다. 다음 단계는 멘토링 조언대로 성대 국제처와 함께, 새로 온 유학생이 첫날 QR 하나로 우리 조를 만나게 하는 것입니다.'),
    ('4:30–4:45', '마무리', '한국에서의 첫날부터 우리 조와 함께하는 서비스, 어울림이었습니다. 지금 QR로 직접 들어와 보세요. 감사합니다.'),
]
VIDEO_SCRIPT = ('1:00–1:52', '홍보 영상 (50초)', '[영상을 클릭해 재생 — 말하지 않고 기다린다. 영상이 안 나오면 PDF판 3장의 화면을 보며 「우리 조 → 한국 친구 → 이벤트」 순서로 한 문장씩 말하고 넘어간다]')
OUT.mkdir(parents=True, exist_ok=True)
FRAMES = ROOT / 'out/frames'
FRAMES.mkdir(parents=True, exist_ok=True)
QR = ROOT / 'assets/qr-eoullim.png'

FONT = 'NanumGothic'
NAVY = RGBColor(0x0F, 0x1B, 0x2E)
NAVY2 = RGBColor(0x22, 0x31, 0x4D)
PURPLE = RGBColor(0x5B, 0x4D, 0xFF)
TINT = RGBColor(0xEE, 0xEC, 0xFF)
INK2 = RGBColor(0x33, 0x40, 0x5A)
MUTED = RGBColor(0x5D, 0x65, 0x77)
SURFACE = RGBColor(0xF5, 0xF6, 0xF8)
LINE = RGBColor(0xE4, 0xE6, 0xEB)
WHITE = RGBColor(0xFF, 0xFF, 0xFF)
NMUTED = RGBColor(0xB9, 0xC1, 0xD6)


# ── 폰 테두리를 씌운 화면 이미지 ──
def framed(name, crop_h=None):
    """screens/<name>.png (3배 해상도) → 둥근 남색 테두리 + 그림자를 입힌 PNG."""
    out = FRAMES / f'{name}{"_" + str(crop_h) if crop_h else ""}.png'
    im = Image.open(SHOTS / f'{name}.png').convert('RGB')
    if crop_h:
        im = im.crop((0, 0, im.width, crop_h))
    s = 640 / im.width
    im = im.resize((640, round(im.height * s)), Image.LANCZOS)
    bez, r_out, pad = 16, 64, 40
    W, H = im.width + bez * 2, im.height + bez * 2
    canvas = Image.new('RGBA', (W + pad * 2, H + pad * 2), (0, 0, 0, 0))
    sh = Image.new('L', canvas.size, 0)
    ImageDraw.Draw(sh).rounded_rectangle((pad, pad + 14, pad + W, pad + H + 14), r_out, fill=70)
    sh = sh.filter(ImageFilter.GaussianBlur(18))
    canvas.paste(Image.new('RGBA', canvas.size, (15, 27, 46, 255)), (0, 0), sh)
    body = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    m = Image.new('L', (W, H), 0)
    ImageDraw.Draw(m).rounded_rectangle((0, 0, W - 1, H - 1), r_out, fill=255)
    body.paste(Image.new('RGBA', (W, H), (15, 27, 46, 255)), (0, 0), m)
    m2 = Image.new('L', im.size, 0)
    ImageDraw.Draw(m2).rounded_rectangle((0, 0, im.width - 1, im.height - 1), r_out - bez, fill=255)
    body.paste(im, (bez, bez), m2)
    canvas.alpha_composite(body, (pad, pad))
    canvas.save(out)
    return out, canvas.width / canvas.height


prs = Presentation()
prs.slide_width, prs.slide_height = Inches(13.333), Inches(7.5)
BLANK = prs.slide_layouts[6]


_count = [0]


def new_slide(bg=None, notes=''):
    if FIVE:
        tm, name, said = FIVE_SCRIPT[_count[0]]
        notes = f'[{tm}] {name}\n\n{said}'
    _count[0] += 1
    s = prs.slides.add_slide(BLANK)
    if bg is not None:
        s.background.fill.solid()
        s.background.fill.fore_color.rgb = bg
    if notes:
        s.notes_slide.notes_text_frame.text = notes
    return s


def text(s, x, y, w, h, t, size=14, bold=False, color=NAVY, align=PP_ALIGN.LEFT, anchor=MSO_ANCHOR.TOP, spacing=1.15):
    tb = s.shapes.add_textbox(Inches(x), Inches(y), Inches(w), Inches(h))
    tf = tb.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = 0
    tf.vertical_anchor = anchor
    for i, line in enumerate(t.split('\n')):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.alignment = align
        p.line_spacing = spacing
        r = p.add_run()
        r.text = line
        r.font.size = Pt(size)
        r.font.bold = bold
        r.font.name = FONT
        r.font.color.rgb = color
    return tb


def box(s, x, y, w, h, fill, line=None, shape=MSO_SHAPE.ROUNDED_RECTANGLE, radius=0.08):
    sp = s.shapes.add_shape(shape, Inches(x), Inches(y), Inches(w), Inches(h))
    sp.fill.solid()
    sp.fill.fore_color.rgb = fill
    if line is None:
        sp.line.fill.background()
    else:
        sp.line.color.rgb = line
        sp.line.width = Pt(1)
    sp.shadow.inherit = False
    if shape == MSO_SHAPE.ROUNDED_RECTANGLE:
        sp.adjustments[0] = radius
    return sp


def phone(s, name, x, y, h, crop_h=None):
    path, ratio = framed(name, crop_h)
    return s.shapes.add_picture(str(path), Inches(x), Inches(y), height=Inches(h))


def badge(s, x, y, label, fill=PURPLE, d=0.62, size=12):
    c = box(s, x, y, d, d, fill, shape=MSO_SHAPE.OVAL)
    text(s, x, y, d, d, label, size, True, WHITE, PP_ALIGN.CENTER, MSO_ANCHOR.MIDDLE)
    return c


def card(s, x, y, w, h, title, body, dark=False):
    box(s, x, y, w, h, NAVY2 if dark else SURFACE)
    box(s, x + 0.2, y + 0.24, 0.06, h - 0.48, PURPLE, shape=MSO_SHAPE.RECTANGLE)
    text(s, x + 0.45, y + 0.2, w - 0.65, 0.4, title, 15, True, WHITE if dark else NAVY)
    text(s, x + 0.45, y + 0.6, w - 0.65, h - 0.7, body, 11.5, False, NMUTED if dark else MUTED, spacing=1.25)


def heading(s, tag, title, sub=None):
    badge(s, 0.7, 0.6, tag, d=0.72, size=12)
    text(s, 1.65, 0.62, 7.0, 0.7, title, 26, True, NAVY, anchor=MSO_ANCHOR.MIDDLE)
    if sub:
        text(s, 0.7, 1.45, 6.5, 0.5, sub, 13, False, MUTED)


# ───────── 1. 표지 ─────────
s = new_slide(NAVY, '안녕하세요, 2gether 팀의 어울림입니다. 어울림은 한국에 온 외국인 유학생에게 「우리 조」를 만들어 주는 캠퍼스 커뮤니티입니다.')
box(s, 9.6, -1.6, 4.8, 4.8, NAVY2, shape=MSO_SHAPE.OVAL)
box(s, 11.2, 5.2, 3.2, 3.2, PURPLE, shape=MSO_SHAPE.OVAL)
text(s, 0.75, 1.5, 7.2, 0.4, '외국인 유학생을 위한 그룹 기반 캠퍼스 커뮤니티', 14, False, NMUTED)
text(s, 0.7, 2.0, 7.2, 1.3, '어울림', 60, True, WHITE)
text(s, 0.78, 3.4, 7.2, 0.6, 'Eoullim', 24, True, RGBColor(0xA9, 0xA0, 0xFF))
text(s, 0.75, 4.35, 7.2, 0.6, '한국에서 함께할 우리 조를 만나요.', 20, False, WHITE)
text(s, 0.75, 6.5, 8.0, 0.4, '팀 2gether  ·  정동근 · 김다미  ·  eoullim-skku.vercel.app', 12, False, NMUTED)
phone(s, 'a01_welcome', 8.55, 0.42, 6.65)

# ───────── 2. 왜 필요한가 ─────────
s = new_slide(WHITE, '학령인구가 줄면서 대학은 유학생으로 빈자리를 채우고 있습니다. 그런데 데려오는 것만큼 중요한 게 정착입니다. 교환학생은 SG MAPLE 버디로 잘 적응하지만, 글로벌 버디는 신입생만 대상이라 2학년 이상, 편입생, 대학원생은 기댈 곳이 없습니다. 1:1 버디가 부담스러운 학생도 있고요. 그래서 1:1이 아니라 오래 가는 그룹이 필요하다고 생각했습니다.')
text(s, 0.7, 0.6, 11.5, 0.8, '데려오는 것만큼, 정착이 중요합니다', 28, True, NAVY)
rows = [
    ('1', '학령인구가 줄고, 유학생이 그 자리를 채웁니다', '대학은 유학생으로 빈자리를 채우는 중 — 인구구조 위기의 한 단면입니다.'),
    ('2', '학위과정 유학생은 버디 프로그램의 사각지대', '교환학생은 SG MAPLE 버디로 잘 적응하지만, 글로벌 버디는 신입생만. 2학년 이상·편입생·대학원생은 기댈 곳이 없습니다.'),
    ('3', '1:1은 부담스럽고, 일회성 모임은 금방 끝납니다', '정해진 한 사람보다 같은 처지의 친구들 — 한 학기 내내 이어지는 관계가 필요합니다.'),
]
for i, (n, t, b) in enumerate(rows):
    y = 1.75 + i * 1.32
    badge(s, 0.7, y, n, d=0.66, size=16)
    text(s, 1.6, y - 0.02, 6.4, 0.45, t, 16, True, NAVY)
    text(s, 1.6, y + 0.45, 6.4, 0.8, b, 12, False, MUTED, spacing=1.25)
box(s, 8.75, 1.8, 3.9, 3.7, TINT)
text(s, 8.75, 2.15, 3.9, 0.4, '성대 글로벌 버디 대상', 13, False, MUTED, PP_ALIGN.CENTER)
text(s, 8.75, 2.75, 3.9, 1.2, '신입생만', 46, True, PURPLE, PP_ALIGN.CENTER)
text(s, 8.75, 4.15, 3.9, 0.9, '2학년 이상·편입생·대학원생은\n기댈 프로그램이 없음', 12, False, INK2, PP_ALIGN.CENTER)
text(s, 0.7, 6.25, 11.8, 0.5, '어울림은 버디를 대신하지 않습니다. 첫날부터 모두에게 「우리 조」를 줍니다.', 15, True, PURPLE)

# ───────── (5분판) 홍보 영상 ─────────
if FIVE:
    import subprocess
    poster = FRAMES / 'video_poster.png'
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', '16.5', '-i', str(VIDEO), '-frames:v', '1', str(poster)], check=True)
    s = prs.slides.add_slide(BLANK)
    s.background.fill.solid()
    s.background.fill.fore_color.rgb = NAVY
    tm, name, said = VIDEO_SCRIPT
    s.notes_slide.notes_text_frame.text = f'[{tm}] {name}\n\n{said}'
    text(s, 0.7, 0.32, 9.0, 0.5, '50초로 보는 어울림', 20, True, WHITE)
    text(s, 7.6, 0.38, 5.0, 0.45, '화면을 클릭하면 재생 · 실제 앱 화면', 12, False, NMUTED, PP_ALIGN.RIGHT)
    s.shapes.add_movie(str(VIDEO), Inches(0.95), Inches(1.0), Inches(11.43), Inches(6.43), poster_frame_image=str(poster), mime_type='video/mp4')

# ───────── 3. 우리 조 ─────────
s = new_slide(WHITE, '어울림의 핵심은 「우리 조」입니다. 학교, 나라, 앱 언어, 닉네임만 고르면 같은 나라 친구 3~4명과 한국인 멘토 1명이 있는 그룹에 자동으로 들어갑니다. 한 학기 내내, 무료입니다. 매주 그룹 미션이 있어서 처음의 어색함도 같이 깹니다.')
heading(s, '그룹', '「우리 조」를 만들어 줍니다', '같은 나라 친구 3~4명 + 한국인 멘토 1명. 학교 → 나라 → 앱 언어 → 닉네임만 고르면 자동 배정.')
card(s, 0.7, 2.2, 6.5, 1.12, '한 학기 내내, 무료', '그룹은 돈을 받지 않습니다. 라포(신뢰 관계)를 쌓는 곳이기 때문입니다.')
card(s, 0.7, 3.47, 6.5, 1.12, '3명이 모이면 시작', '4명이 차면 다음 조로. 멘토 1명은 최대 3개 조까지 맡습니다.')
card(s, 0.7, 4.74, 6.5, 1.12, '매주 그룹 미션', '학식 같이 먹기, 내 나라 노래 추천, 멘토와 동네 산책 — 서먹함을 깨는 작은 숙제.')
text(s, 0.7, 6.15, 6.5, 0.5, '모든 화면 맨 위에 내 소속이 보입니다 — 성균관대학교 › 필리핀 2조', 12, False, INK2)
phone(s, 'a02_setup', 7.55, 0.75, 6.0)
phone(s, 'a03_group', 10.25, 0.75, 6.0)

# ───────── 4. 한국 친구 + 번역 ─────────
s = new_slide(WHITE, '멘토링에서 「그 나라에 관심 있는 한국 학생은 어떻게 들어오나요?」라는 질문을 받고 만든 기능입니다. 한국 학생은 관심 있는 나라를 최대 3개 고르면, 그 나라 그룹에 「한국 친구」로 들어갑니다. 1:1 매칭이 아니라 그룹 안의 자리입니다. 그리고 채팅은 어떤 언어로 써도 각자 자기 언어로 자동 번역됩니다.')
heading(s, '친구', '관심 있는 한국 학생은 「한국 친구」로', '1:1 매칭이 아니라 그룹 안의 자리. 멘토링 피드백을 반영했습니다.')
card(s, 0.7, 2.2, 6.5, 1.12, '관심 나라를 고르면 그 나라 조로', '최대 3개 나라, 고른 순서대로 빈자리가 있는 조에 자동 배정 (조마다 2명까지).')
card(s, 0.7, 3.47, 6.5, 1.12, '한국 친구 ≠ 멘토', '한국 친구는 누구나·무료. 멘토는 초대 코드로 조를 책임지고 수익 몫을 받습니다.')
card(s, 0.7, 4.74, 6.5, 1.12, '어떤 언어로 써도, 내 언어로 읽기', '15개 언어. 그룹 채팅·게시판·이벤트가 자동 번역되고 「원문 보기」도 됩니다.')
text(s, 0.7, 6.15, 6.5, 0.5, '오른쪽: 한국 친구 서연의 화면 — 필리핀 친구 Joy의 영어·타갈로그어 메시지가 한국어로', 12, False, INK2)
phone(s, 'b01_setup_kr', 7.55, 0.75, 6.0)
phone(s, 'b03_group_chat_kr', 10.25, 0.75, 6.0)

# ───────── 5. 이벤트 ─────────
s = new_slide(WHITE, '그룹은 무료이고, 수익은 이벤트에서 냅니다. 사주 카페나 신당동 귀신 골목 투어처럼 한국에서만 할 수 있는 체험, 필리핀 Undas나 베트남 여성의 날 같은 나라별 명절, 그룹 대항 체육대회를 엽니다. 참가비의 15%가 어울림의 수수료입니다. 2일 전까지 무료 취소, 최소 인원이 안 모이면 자동으로 전액 환불됩니다.')
heading(s, '이벤트', '그룹을 잇는 이벤트 = 메인 수익', '사람들이 원래 돈을 내는 활동이라 결제 저항이 작고, 조끼리 모이며 관계도 쌓입니다.')
card(s, 0.7, 2.2, 6.5, 1.12, '한국에서만 · 나라별 명절 · 그룹 대항', '사주 카페, 신당동 귀신 골목 투어, 한복 고궁 산책 / 필리핀 Undas, 베트남 여성의 날 / 체육대회.')
card(s, 0.7, 3.47, 6.5, 1.12, '참가비의 15% = 어울림 수수료', '나머지 85%는 진행 예산. 한국인 멘토와 어울림 운영팀만 이벤트를 엽니다.')
card(s, 0.7, 4.74, 6.5, 1.12, '안심 규칙', '행사 2일 전까지 무료 취소. 2일 전까지 최소 인원이 안 모이면 자동 취소·전액 환불.')
text(s, 0.7, 6.15, 6.5, 0.5, '나라별 행사에는 「그 나라에 관심 있는 한국 학생 n명」이 보여 참가자가 넓어집니다.', 12, False, INK2)
phone(s, 'a05_events', 7.55, 0.75, 6.0)
phone(s, 'a07_pay', 10.25, 0.75, 6.0)

# ───────── 6. 커뮤니티 + 포인트 ─────────
s = new_slide(WHITE, '그룹 밖의 가벼운 도움은 커뮤니티 게시판 하나에서 해결합니다. 질문을 쓰면 사람에게 가기 전에 성대 공식 안내부터 보여 줍니다. 포인트는 선택입니다. 걸면 답이 더 빨리 오고, 72시간 동안 답이 없으면 전액 환불됩니다. 이것이 보조 수익입니다.')
heading(s, '커뮤니티', '가벼운 도움은 커뮤니티에서', '질문·도움 / 같이 해요 / 자유 / 언어별 라운지 — 게시판 하나.')
card(s, 0.7, 2.2, 6.5, 1.12, '공식 안내를 먼저', '제목을 쓰는 동안 성대 공식 안내에서 찾아 출처와 함께 보여 줍니다. 해결되면 끝.')
card(s, 0.7, 3.47, 6.5, 1.12, '알려줄 · 빌려줄 · 해줄 사람', '질문뿐 아니라 "우산 빌려줄 사람", "병원 전화해 줄 사람" 같은 부탁도.')
card(s, 0.7, 4.74, 6.5, 1.12, '포인트는 선택 (보조 수익)', '100원 = 1P. 걸면 답이 빨라지고, 72시간 동안 답이 없으면 전액 자동 환불.')
text(s, 0.7, 6.15, 6.5, 0.5, '대리 출석·과제 대행·돈 빌리기 같은 요청은 올리기 전에 막습니다.', 12, False, INK2)
phone(s, 'a09_community', 7.55, 0.75, 6.0)
phone(s, 'a10_ask', 10.25, 0.75, 6.0)

# ───────── 7. 수익 구조 · 멘토 ─────────
s = new_slide(WHITE, '정리하면, 그룹은 무료로 두고 이벤트 수수료가 메인, 포인트가 보조 수익입니다. 어울림 수익의 30%는 한국인 멘토가 실적대로 나눠 받습니다. 한국 학생에게는 캠퍼스 일자리가 되고, 멘토가 계속 조를 돌볼 이유가 생깁니다.')
heading(s, '수익', '그룹은 무료, 수익은 이벤트에서', '돈을 받는 순간 라포가 흐려집니다 — 핵심은 무료로 두고 부가서비스로 법니다.')
flow = [
    ('우리 조', '무료', '라포 형성 · 정착'),
    ('이벤트', '참가비 15%', '메인 수익'),
    ('포인트', '100원 = 1P', '보조 수익'),
    ('한국인 멘토', '수익의 30%', '실적대로 나눔'),
]
for i, (a, b, c) in enumerate(flow):
    x = 0.7 + i * 1.72
    hl = i == 1
    box(s, x, 2.3, 1.55, 2.0, PURPLE if hl else SURFACE)
    text(s, x, 2.5, 1.55, 0.4, a, 13, True, WHITE if hl else NAVY, PP_ALIGN.CENTER)
    text(s, x, 3.0, 1.55, 0.6, b, 15, True, WHITE if hl else PURPLE, PP_ALIGN.CENTER, MSO_ANCHOR.MIDDLE)
    text(s, x, 3.7, 1.55, 0.4, c, 10.5, False, WHITE if hl else MUTED, PP_ALIGN.CENTER)
text(s, 0.7, 4.75, 6.8, 0.9, '예: ₩12,000 필리핀 Undas 저녁 → 어울림 수수료 ₩1,800\n멘토 몫은 그룹(최대 3개)·이벤트·답변·관리 실적대로 나눕니다.', 12.5, False, INK2, spacing=1.35)
text(s, 0.7, 6.15, 6.8, 0.5, '한국 학생에게는 캠퍼스 일자리, 유학생에게는 계속 곁에 있는 멘토.', 14, True, PURPLE)
phone(s, 'c01_mentor', 8.9, 0.75, 6.0)

# ───────── 8. 개인정보 · 다음 단계 ─────────
s = new_slide(NAVY, '회원가입도 로그인도 없습니다. 이름, 학번, 연락처를 받지 않고, 나라는 그룹을 만드는 데만 씁니다. 번역도 유료 AI 없이 무료 서비스만 씁니다. 멘토링에서 성대 국제처와 협업해 보라는 조언을 받았고, 다음 단계는 새로 온 유학생이 첫날 QR 하나로 우리 조를 만나게 하는 것입니다.')
text(s, 0.7, 0.7, 11.5, 0.8, '처음부터 개인정보 없이', 28, True, WHITE)
items = [
    ('가입·로그인 없음', 'QR 찍고 바로 시작. 기기마다 무작위 복구 코드.'),
    ('묻지 않습니다', '이름·학번·전화·이메일·위치를 받지 않습니다.'),
    ('나라는 그룹에만', '그룹을 만드는 데만 쓰고, 글에는 보이지 않습니다.'),
    ('연락처 자동 가림', '글·채팅 속 전화번호·이메일·메신저 ID는 ***로.'),
]
for i, (t, b) in enumerate(items):
    x = 0.7 + (i % 2) * 6.0
    y = 1.85 + (i // 2) * 1.45
    box(s, x, y, 5.7, 1.2, NAVY2)
    text(s, x + 0.4, y + 0.22, 5.0, 0.4, t, 16, True, WHITE)
    text(s, x + 0.4, y + 0.66, 5.0, 0.4, b, 12, False, NMUTED)
text(s, 0.7, 5.0, 11.7, 0.5, '다음 단계: 성대 국제처와 함께, 새로 온 유학생이 첫날 QR 하나로 우리 조를 만나게.', 17, True, WHITE)
text(s, 0.7, 5.6, 11.7, 0.4, '멘토링 피드백 「성대 국제처와 협업해 홍보해 보라」', 12, False, NMUTED)
text(s, 0.7, 6.5, 11.7, 0.4, '유료 AI 없음 — 번역은 무료 서비스, 공식 안내 검색과 자동 가림은 규칙 기반이라 서버 비용이 거의 들지 않습니다.', 11, False, NMUTED)

# ───────── 9. 마무리 ─────────
s = new_slide(WHITE, '한국에서의 첫날부터 우리 조와 함께하는 서비스, 어울림이었습니다. 지금 QR로 들어와 직접 그룹에 들어가 보세요. 감사합니다.')
box(s, -1.2, 4.6, 4.2, 4.2, TINT, shape=MSO_SHAPE.OVAL)
text(s, 0.9, 1.75, 7.4, 1.8, '한국에서의 첫날부터,\n우리 조와 함께.', 36, True, NAVY, spacing=1.2)
text(s, 0.95, 3.95, 7.0, 0.5, '지금 QR로 들어와 직접 우리 조를 만나 보세요.', 15, False, MUTED)
text(s, 0.95, 6.4, 8.0, 0.4, '어울림 Eoullim  ·  팀 2gether  ·  eoullim-skku.vercel.app', 12, False, MUTED)
s.shapes.add_picture(str(QR), Inches(8.9), Inches(1.6), height=Inches(3.6))
text(s, 8.9, 5.35, 3.6, 0.4, 'eoullim-skku.vercel.app', 12, False, MUTED, PP_ALIGN.CENTER)

out = OUT / ('어울림_발표_5분.pptx' if FIVE else '어울림_발표.pptx')
prs.save(out)
print('저장:', out, f'({len(prs.slides)}장)')

if FIVE:
    rows = FIVE_SCRIPT[:2] + [VIDEO_SCRIPT] + FIVE_SCRIPT[2:]
    md = ['# 어울림 발표 대본 — 5분판 (영상 50초 포함)', '',
          '발표: 김다미 · 팀 2gether · 파일 `어울림_발표_5분.pptx` (PDF판 `어울림_발표_5분.pdf`) · 합계 **4분 45초** (15초 여유)', '',
          '| 장 | 시간 | 내용 |', '|---|---|---|']
    md += [f'| {i} | {tm} | {name} |' for i, (tm, name, _) in enumerate(rows, 1)]
    md += ['']
    for i, (tm, name, said) in enumerate(rows, 1):
        md += [f'## {i}. {name}  `{tm}`', '', said, '']
    md += ['---', '', '- 영상은 3장에 들어 있다. 화면을 클릭하면 재생 (소리 있음). 발표장 PC에서 미리 한 번 틀어 보기',
           '- PDF로 발표하면 영상이 안 나온다 → 영상 파일 `어울림_홍보영상_50초_2026-10-03.mp4`를 따로 틀고 돌아온다',
           '- 시간이 밀리면 7장(커뮤니티)을 한 문장으로 줄인다: 「가벼운 도움은 커뮤니티에서, 공식 안내부터 먼저 보여 줍니다.」']
    (OUT / '어울림_발표대본_5분.md').write_text('\n'.join(md) + '\n', encoding='utf-8')
    body = ''.join(f'<section><h2><span>{i}</span>{name}<time>{tm}</time></h2><p>{said}</p></section>' for i, (tm, name, said) in enumerate(rows, 1))
    table = ''.join(f'<tr><td>{i}</td><td>{tm}</td><td>{name}</td></tr>' for i, (tm, name, _) in enumerate(rows, 1))
    html = f'''<!doctype html><html lang="ko"><head><meta charset="utf-8"><title>어울림 발표 대본 5분</title><style>
@page {{ size: A4; margin: 16mm 16mm; }} body {{ font-family: 'NanumGothic', sans-serif; color: #0F1B2E; font-size: 11pt; line-height: 1.7; word-break: keep-all; margin: 0; }}
h1 {{ font-size: 20pt; margin: 0 0 4px; }} .sub {{ color: #5D6577; margin: 0 0 14px; }}
table {{ border-collapse: collapse; width: 100%; margin-bottom: 18px; font-size: 10pt; }} td {{ padding: 4px 8px; border-bottom: 1px solid #E4E6EB; }} tr td:first-child {{ width: 30px; color: #5B4DFF; font-weight: 700; }} tr td:nth-child(2) {{ width: 110px; font-family: Menlo, monospace; }}
section {{ break-inside: avoid; margin: 0 0 14px; }} h2 {{ font-size: 13pt; margin: 0 0 4px; display: flex; gap: 10px; align-items: center; }}
h2 span {{ display: inline-grid; place-items: center; width: 26px; height: 26px; border-radius: 50%; background: #5B4DFF; color: #fff; font-size: 11pt; }}
h2 time {{ margin-left: auto; font-family: Menlo, monospace; font-size: 10pt; color: #2B1FB8; background: #EEECFF; padding: 2px 8px; border-radius: 6px; }}
p {{ margin: 0; padding-left: 36px; }} .tip {{ margin-top: 18px; padding: 10px 12px; background: #F5F6F8; border-radius: 8px; font-size: 10pt; }}
</style></head><body><h1>어울림 발표 대본 — 5분판</h1><p class="sub">발표 김다미 · 팀 2gether · 홍보 영상 50초 포함 합계 4분 45초 (15초 여유)</p>
<table>{table}</table>{body}
<div class="tip">· 3장 영상은 화면을 클릭하면 재생(소리 있음). 발표장 PC에서 미리 한 번 틀어 보기<br>· PDF로 발표하면 영상이 안 나온다 → 영상 파일을 따로 틀고 돌아온다<br>· 시간이 밀리면 7장(커뮤니티)을 한 문장으로: 「가벼운 도움은 커뮤니티에서, 공식 안내부터 먼저 보여 줍니다.」</div></body></html>'''
    (OUT / '어울림_발표대본_5분.html').write_text(html, encoding='utf-8')
    print('대본:', OUT / '어울림_발표대본_5분.md')
