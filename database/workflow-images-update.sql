-- =====================================================
-- UPDATE WORKFLOW IMAGES
-- Beautiful AI-generated style images for workflows
-- =====================================================

-- Workflow 1: E-commerce Order Automation
-- Modern e-commerce dashboard with purple gradient
UPDATE nlc_workflows
SET workflow_thumbnail = 'https://images.unsplash.com/photo-1557821552-17105176677c?w=800&h=600&fit=crop&q=80',
    workflow_preview_images = ARRAY[
        'https://images.unsplash.com/photo-1557821552-17105176677c?w=800&h=600&fit=crop&q=80',
        'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=600&fit=crop&q=80',
        'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&h=600&fit=crop&q=80'
    ]
WHERE workflow_slug = 'ecommerce-order-automation';

-- Workflow 2: Social Media Content Scheduler
-- Vibrant social media marketing with gradients
UPDATE nlc_workflows
SET workflow_thumbnail = 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&h=600&fit=crop&q=80',
    workflow_preview_images = ARRAY[
        'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&h=600&fit=crop&q=80',
        'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=800&h=600&fit=crop&q=80',
        'https://images.unsplash.com/photo-1432888622747-4eb9a8f2c293?w=800&h=600&fit=crop&q=80'
    ]
WHERE workflow_slug = 'social-media-scheduler';

-- Workflow 3: Data Scraping & Analysis Workflow
-- Data analytics dashboard with charts
UPDATE nlc_workflows
SET workflow_thumbnail = 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop&q=80',
    workflow_preview_images = ARRAY[
        'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop&q=80',
        'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop&q=80',
        'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=800&h=600&fit=crop&q=80'
    ]
WHERE workflow_slug = 'data-scraping-analysis';

-- Add more metadata for better presentation
UPDATE nlc_workflows
SET
    seo_title = workflow_name || ' - n8n Workflow Automation | Knowledge Base',
    seo_description = workflow_description,
    seo_keywords = tags,
    updated_at = NOW()
WHERE workflow_slug IN ('ecommerce-order-automation', 'social-media-scheduler', 'data-scraping-analysis');

-- Success message
SELECT
    '✅ Workflow images updated successfully!' as status,
    COUNT(*) as workflows_updated
FROM nlc_workflows
WHERE workflow_thumbnail LIKE 'https://images.unsplash.com%';
