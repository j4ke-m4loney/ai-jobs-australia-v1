#!/bin/bash

# Test script for Outrank webhook integration
# Usage: ./test-outrank-webhook.sh

echo "Testing Outrank Webhook Integration..."
echo "======================================="
echo ""

# Test Article 1: Create new draft
echo "Test 1: Creating new article..."
curl -X POST http://localhost:3000/api/webhooks/outrank \
  -H "Authorization: Bearer d5867aa6eb999e19fc2224ec02429412721715055faf7ae88f96951a7b1269cc" \
  -H "Content-Type: application/json" \
  -d '{
    "event_type": "publish_articles",
    "timestamp": "2025-12-28T12:00:00Z",
    "data": {
      "articles": [
        {
          "id": "test-001",
          "title": "The Future of AI in Australian Healthcare",
          "content_markdown": "# Healthcare AI",
          "content_html": "<h1>The Future of AI in Australian Healthcare</h1><p>Artificial intelligence is revolutionizing healthcare across Australia. From diagnostic imaging to personalized treatment plans, AI technologies are improving patient outcomes and reducing costs. Machine learning algorithms can now detect diseases earlier than traditional methods, while natural language processing helps doctors analyze patient records more efficiently. This article explores the current state and future potential of AI in Australian healthcare systems.</p>",
          "meta_description": "Exploring how AI is transforming healthcare in Australia",
          "created_at": "2025-12-28T10:00:00Z",
          "image_url": "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d",
          "slug": "future-ai-australian-healthcare",
          "tags": ["AI", "healthcare", "australia", "technology"]
        }
      ]
    }
  }'

echo ""
echo ""
echo "Test 2: Updating existing article..."
sleep 2

# Test Article 2: Update existing (same slug)
curl -X POST http://localhost:3000/api/webhooks/outrank \
  -H "Authorization: Bearer d5867aa6eb999e19fc2224ec02429412721715055faf7ae88f96951a7b1269cc" \
  -H "Content-Type: application/json" \
  -d '{
    "event_type": "publish_articles",
    "timestamp": "2025-12-28T13:00:00Z",
    "data": {
      "articles": [
        {
          "id": "test-001",
          "title": "The Future of AI in Australian Healthcare - 2025 Update",
          "content_markdown": "# Healthcare AI Updated",
          "content_html": "<h1>The Future of AI in Australian Healthcare - 2025 Update</h1><p>Updated content: Artificial intelligence continues to revolutionize healthcare across Australia with new breakthroughs in 2025. Recent advancements in deep learning have enabled even more accurate diagnoses, while AI-powered robotic surgery is becoming mainstream in major hospitals.</p>",
          "meta_description": "Updated: Exploring how AI is transforming healthcare in Australia in 2025",
          "created_at": "2025-12-28T12:00:00Z",
          "image_url": "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d",
          "slug": "future-ai-australian-healthcare",
          "tags": ["AI", "healthcare", "australia", "technology", "2025"]
        }
      ]
    }
  }'

echo ""
echo ""
echo "Test 3: Testing authentication (should fail)..."
sleep 2

# Test 3: Invalid token (should fail)
curl -X POST http://localhost:3000/api/webhooks/outrank \
  -H "Authorization: Bearer invalid-token" \
  -H "Content-Type: application/json" \
  -d '{
    "event_type": "publish_articles",
    "timestamp": "2025-12-28T14:00:00Z",
    "data": {
      "articles": [
        {
          "id": "test-002",
          "title": "This Should Fail",
          "content_html": "<p>Test</p>",
          "slug": "should-fail",
          "tags": []
        }
      ]
    }
  }'

echo ""
echo ""
echo "======================================="
echo "Testing complete!"
echo "Check http://localhost:3000/admin/blog to see the draft articles"
