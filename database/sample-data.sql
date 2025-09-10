-- Insert categories
INSERT INTO public.categories (id, name, slug, description, icon_url) VALUES
    (uuid_generate_v4(), 'BIM & Revit', 'bim-revit', 'Khóa học về Building Information Modeling và Autodesk Revit', '/icons/bim.svg'),
    (uuid_generate_v4(), 'AutoCAD', 'autocad', 'Khóa học về thiết kế kỹ thuật với AutoCAD', '/icons/autocad.svg'),
    (uuid_generate_v4(), 'Kết cấu', 'ket-cau', 'Khóa học về tính toán và thiết kế kết cấu xây dựng', '/icons/structure.svg'),
    (uuid_generate_v4(), 'Quản lý dự án', 'quan-ly', 'Khóa học về quản lý và điều phối dự án xây dựng', '/icons/management.svg'),
    (uuid_generate_v4(), 'Kiến trúc', 'kien-truc', 'Khóa học về thiết kế kiến trúc và quy hoạch', '/icons/architecture.svg');

-- Get category IDs for reference
WITH category_data AS (
    SELECT id, slug FROM public.categories
)
-- Insert sample courses
INSERT INTO public.courses (
    id, title, slug, description, short_description, image_url, price, original_price, 
    category_id, instructor_name, instructor_avatar, level, duration_hours, lessons_count, 
    students_count, rating, reviews_count, is_featured, tags, what_you_learn, requirements
) 
SELECT 
    uuid_generate_v4(),
    'Revit Architecture từ cơ bản đến nâng cao',
    'revit-architecture-co-ban-den-nang-cao',
    'Khóa học toàn diện về Revit Architecture, từ những kiến thức cơ bản đến các kỹ thuật nâng cao. Bạn sẽ học cách tạo mô hình 3D, xuất bản vẽ kỹ thuật, và quản lý dự án BIM hiệu quả.',
    'Học Revit Architecture từ A-Z với các dự án thực tế',
    '/images/courses/revit-architecture.jpg',
    2500000,
    3500000,
    c1.id,
    'KS. Nguyễn Văn Nam',
    '/images/instructors/nguyen-van-nam.jpg',
    'beginner',
    40,
    25,
    1250,
    4.8,
    156,
    true,
    ARRAY['Revit', 'BIM', 'Architecture', '3D Modeling'],
    ARRAY[
        'Thành thạo giao diện và các công cụ cơ bản của Revit',
        'Tạo mô hình kiến trúc 3D hoàn chỉnh',
        'Xuất bản vẽ kỹ thuật chuyên nghiệp',
        'Quản lý Family và Library',
        'Làm việc nhóm với Central File',
        'Tích hợp với các phần mềm khác'
    ],
    ARRAY[
        'Máy tính có cấu hình tối thiểu Core i5, RAM 8GB',
        'Đã cài đặt Autodesk Revit (phiên bản 2020 trở lên)',
        'Kiến thức cơ bản về xây dựng'
    ]
FROM category_data c1 WHERE c1.slug = 'bim-revit'

UNION ALL

SELECT 
    uuid_generate_v4(),
    'AutoCAD 2D/3D cho kỹ sư xây dựng',
    'autocad-2d-3d-cho-ky-su-xay-dung',
    'Khóa học AutoCAD chuyên sâu dành cho kỹ sư xây dựng, bao gồm cả 2D và 3D. Học cách vẽ bản vẽ kỹ thuật, tạo khối 3D, và tối ưu hóa quy trình thiết kế.',
    'Thành thạo AutoCAD 2D/3D cho ngành xây dựng',
    '/images/courses/autocad-2d-3d.jpg',
    1800000,
    2800000,
    c2.id,
    'KS. Trần Thị Lan',
    '/images/instructors/tran-thi-lan.jpg',
    'beginner',
    35,
    22,
    2100,
    4.7,
    287,
    true,
    ARRAY['AutoCAD', '2D', '3D', 'Technical Drawing'],
    ARRAY[
        'Vẽ bản vẽ kỹ thuật 2D chính xác',
        'Tạo mô hình 3D từ bản vẽ 2D',
        'Sử dụng Block và Dynamic Block',
        'Quản lý Layer và Plot Settings',
        'Tối ưu hóa quy trình làm việc',
        'In ấn và xuất file chuyên nghiệp'
    ],
    ARRAY[
        'Máy tính cấu hình cơ bản',
        'Đã cài đặt AutoCAD',
        'Không cần kinh nghiệm trước đó'
    ]
FROM category_data c2 WHERE c2.slug = 'autocad'

UNION ALL

SELECT 
    uuid_generate_v4(),
    'Tính toán kết cấu bê tông cốt thép',
    'tinh-toan-ket-cau-be-tong-cot-thep',
    'Khóa học chuyên sâu về tính toán và thiết kế kết cấu bê tông cốt thép theo tiêu chuẩn Việt Nam. Bao gồm lý thuyết và thực hành với các phần mềm chuyên dụng.',
    'Thiết kế kết cấu BTCT theo tiêu chuẩn VN',
    '/images/courses/be-tong-cot-thep.jpg',
    3200000,
    4200000,
    c3.id,
    'PGS.TS Lê Văn Đức',
    '/images/instructors/le-van-duc.jpg',
    'intermediate',
    50,
    30,
    850,
    4.9,
    95,
    true,
    ARRAY['Concrete', 'Structure', 'TCVN', 'Design'],
    ARRAY[
        'Hiểu rõ lý thuyết tính toán BTCT',
        'Thiết kế dầm, cột, sàn BTCT',
        'Áp dụng tiêu chuẩn TCVN hiện hành',
        'Sử dụng phần mềm tính toán kết cấu',
        'Kiểm tra và tối ưu hóa thiết kế',
        'Lập báo cáo tính toán chuyên nghiệp'
    ],
    ARRAY[
        'Có kiến thức nền về cơ học kết cấu',
        'Hiểu biết cơ bản về vật liệu xây dựng',
        'Máy tính có phần mềm tính toán'
    ]
FROM category_data c3 WHERE c3.slug = 'ket-cau'

UNION ALL

SELECT 
    uuid_generate_v4(),
    'Quản lý dự án xây dựng với MS Project',
    'quan-ly-du-an-xay-dung-ms-project',
    'Học cách quản lý dự án xây dựng hiệu quả sử dụng Microsoft Project. Từ lập kế hoạch, phân bổ tài nguyên đến theo dõi tiến độ và báo cáo.',
    'Quản lý dự án chuyên nghiệp với MS Project',
    '/images/courses/ms-project.jpg',
    2200000,
    3000000,
    c4.id,
    'Ing. Phạm Minh Tuấn',
    '/images/instructors/pham-minh-tuan.jpg',
    'intermediate',
    30,
    18,
    1500,
    4.6,
    198,
    false,
    ARRAY['Project Management', 'MS Project', 'Construction', 'Planning'],
    ARRAY[
        'Lập kế hoạch dự án chi tiết',
        'Phân bổ và quản lý tài nguyên',
        'Theo dõi tiến độ thực hiện',
        'Tạo báo cáo và dashboard',
        'Quản lý rủi ro dự án',
        'Giao tiếp hiệu quả với stakeholders'
    ],
    ARRAY[
        'Có kinh nghiệm cơ bản về xây dựng',
        'Đã cài đặt Microsoft Project',
        'Hiểu biết về quy trình thi công'
    ]
FROM category_data c4 WHERE c4.slug = 'quan-ly'

UNION ALL

SELECT 
    uuid_generate_v4(),
    'SketchUp Pro cho kiến trúc sư',
    'sketchup-pro-cho-kien-truc-su',
    'Khóa học SketchUp Pro dành riêng cho kiến trúc sư và designer. Học cách tạo mô hình 3D, render, và trình bày ý tưởng thiết kế một cách hiệu quả.',
    'Tạo mô hình 3D kiến trúc với SketchUp Pro',
    '/images/courses/sketchup-pro.jpg',
    1500000,
    2200000,
    c5.id,
    'KTS. Hoàng Thị Mai',
    '/images/instructors/hoang-thi-mai.jpg',
    'beginner',
    25,
    15,
    1800,
    4.5,
    234,
    false,
    ARRAY['SketchUp', 'Architecture', '3D Modeling', 'Design'],
    ARRAY[
        'Thành thạo các công cụ cơ bản của SketchUp',
        'Tạo mô hình kiến trúc 3D phức tạp',
        'Sử dụng Component và Group hiệu quả',
        'Áp dụng Material và Texture',
        'Tạo Scene và Animation',
        'Xuất file để render và in ấn'
    ],
    ARRAY[
        'Máy tính cấu hình trung bình',
        'Đã cài đặt SketchUp Pro',
        'Có kiến thức cơ bản về thiết kế'
    ]
FROM category_data c5 WHERE c5.slug = 'kien-truc'

UNION ALL

SELECT 
    uuid_generate_v4(),
    'Tekla Structures cho kết cấu thép',
    'tekla-structures-cho-ket-cau-thep',
    'Khóa học chuyên sâu về Tekla Structures dành cho thiết kế kết cấu thép. Học cách tạo mô hình 3D, chi tiết kết nối, và xuất bản vẽ thi công.',
    'Thiết kế kết cấu thép chuyên nghiệp',
    '/images/courses/tekla-structures.jpg',
    3800000,
    5000000,
    c3.id,
    'KS. Vũ Đình Cường',
    '/images/instructors/vu-dinh-cuong.jpg',
    'advanced',
    60,
    35,
    450,
    4.8,
    67,
    true,
    ARRAY['Tekla', 'Steel Structure', '3D Modeling', 'Detailing'],
    ARRAY[
        'Tạo mô hình kết cấu thép 3D chính xác',
        'Thiết kế chi tiết kết nối phức tạp',
        'Xuất bản vẽ thi công và gia công',
        'Tạo danh sách vật liệu tự động',
        'Kiểm tra va chạm và xung đột',
        'Tích hợp với các phần mềm khác'
    ],
    ARRAY[
        'Có kinh nghiệm về kết cấu thép',
        'Máy tính cấu hình cao',
        'Đã cài đặt Tekla Structures'
    ]
FROM category_data c3 WHERE c3.slug = 'ket-cau'

UNION ALL

SELECT 
    uuid_generate_v4(),
    'Civil 3D cho thiết kế đường và cầu',
    'civil-3d-cho-thiet-ke-duong-cau',
    'Khóa học AutoCAD Civil 3D cho thiết kế hạ tầng giao thông. Bao gồm thiết kế đường, cầu, và các công trình thủy lợi với mô hình 3D.',
    'Thiết kế hạ tầng giao thông với Civil 3D',
    '/images/courses/civil-3d.jpg',
    2800000,
    3800000,
    c2.id,
    'KS. Đặng Văn Hùng',
    '/images/instructors/dang-van-hung.jpg',
    'intermediate',
    45,
    28,
    720,
    4.7,
    89,
    false,
    ARRAY['Civil 3D', 'Road Design', 'Bridge', 'Infrastructure'],
    ARRAY[
        'Thiết kế tuyến đường 3D',
        'Tạo mặt cắt ngang và dọc',
        'Tính toán khối lượng đất đá',
        'Thiết kế hệ thống thoát nước',
        'Tạo bản vẽ thi công chi tiết',
        'Quản lý dữ liệu địa hình'
    ],
    ARRAY[
        'Thành thạo AutoCAD cơ bản',
        'Có kiến thức về thiết kế đường',
        'Máy tính cấu hình trung bình trở lên'
    ]
FROM category_data c2 WHERE c2.slug = 'autocad';

-- Insert sample course content for one course
UPDATE public.courses 
SET course_content = '{
    "modules": [
        {
            "title": "Giới thiệu về Revit Architecture",
            "lessons": [
                {"title": "Tổng quan về BIM và Revit", "duration": "30 phút", "type": "video"},
                {"title": "Cài đặt và cấu hình Revit", "duration": "20 phút", "type": "video"},
                {"title": "Giao diện và navigation cơ bản", "duration": "45 phút", "type": "video"}
            ]
        },
        {
            "title": "Các công cụ cơ bản",
            "lessons": [
                {"title": "Wall và Door/Window", "duration": "60 phút", "type": "video"},
                {"title": "Floor và Ceiling", "duration": "45 phút", "type": "video"},
                {"title": "Stair và Ramp", "duration": "50 phút", "type": "video"},
                {"title": "Bài tập thực hành", "duration": "90 phút", "type": "exercise"}
            ]
        },
        {
            "title": "Mô hình 3D nâng cao",
            "lessons": [
                {"title": "Mass và Conceptual Design", "duration": "40 phút", "type": "video"},
                {"title": "Roof và Complex Geometry", "duration": "55 phút", "type": "video"},
                {"title": "Site và Topography", "duration": "35 phút", "type": "video"}
            ]
        }
    ]
}'::jsonb
WHERE slug = 'revit-architecture-co-ban-den-nang-cao';