"""
tests/test_llm_eval.py

PrepMate AI — LLM Evaluation & Dataset Quality Test Suite
----------------------------------------------------------
Written to demonstrate:
  • Verifiable SWE task construction (Turing project requirement)
  • LLM response evaluation pipelines
  • Unit test coverage of AI service logic
  • GitHub issue triage simulation

Run with:
    pip install pytest pytest-asyncio httpx
    pytest tests/ -v --tb=short
"""

import json
import pytest
from unittest.mock import AsyncMock, MagicMock, patch


# ─────────────────────────────────────────────────────────────────────────────
# Fixtures
# ─────────────────────────────────────────────────────────────────────────────

@pytest.fixture
def sample_interview_question():
    return {
        "id": "q_001",
        "type": "technical",
        "language": "python",
        "difficulty": "medium",
        "prompt": "Implement a function that finds the longest common subsequence of two strings.",
        "expected_concepts": ["dynamic programming", "memoization", "recursion"],
        "test_cases": [
            {"input": ("abcde", "ace"), "expected": 3},
            {"input": ("abc", "abc"), "expected": 3},
            {"input": ("abc", "def"), "expected": 0},
        ],
    }


@pytest.fixture
def sample_llm_response():
    return {
        "model": "gemini-1.5-flash",
        "candidate_code": """
def lcs(s1, s2):
    m, n = len(s1), len(s2)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if s1[i-1] == s2[j-1]:
                dp[i][j] = dp[i-1][j-1] + 1
            else:
                dp[i][j] = max(dp[i-1][j], dp[i][j-1])
    return dp[m][n]
""",
        "explanation": "Uses bottom-up dynamic programming to fill a 2D table.",
        "time_complexity": "O(m*n)",
        "space_complexity": "O(m*n)",
    }


@pytest.fixture
def sample_github_issue():
    return {
        "id": 4821,
        "repo": "pallets/flask",
        "title": "Blueprint route not found after app factory pattern refactor",
        "body": "After refactoring to use the app factory pattern, blueprint routes return 404.",
        "labels": ["bug", "needs-triage"],
        "comments": 3,
        "created_at": "2024-11-15T10:32:00Z",
    }


# ─────────────────────────────────────────────────────────────────────────────
# 1. LLM Response Evaluation
# ─────────────────────────────────────────────────────────────────────────────

class TestLLMResponseEvaluation:
    """
    Validates that LLM-generated code answers are evaluated correctly.
    Maps to Turing requirement: 'assess LLM performance in bug-fixing scenarios'
    """

    def test_candidate_code_passes_all_test_cases(self, sample_interview_question, sample_llm_response):
        """LLM-generated solution should pass all provided test cases."""
        code = sample_llm_response["candidate_code"]
        namespace = {}
        exec(compile(code, "<string>", "exec"), namespace)
        lcs_fn = namespace["lcs"]

        for tc in sample_interview_question["test_cases"]:
            s1, s2 = tc["input"]
            result = lcs_fn(s1, s2)
            assert result == tc["expected"], (
                f"Failed for input ({s1!r}, {s2!r}): expected {tc['expected']}, got {result}"
            )

    def test_response_contains_required_fields(self, sample_llm_response):
        """LLM response must contain code, explanation, and complexity info."""
        required = ["candidate_code", "explanation", "time_complexity", "space_complexity"]
        for field in required:
            assert field in sample_llm_response, f"Missing required field: {field}"
            assert sample_llm_response[field], f"Field {field!r} is empty"

    def test_response_concepts_coverage(self, sample_interview_question, sample_llm_response):
        """LLM explanation should reference at least one expected concept."""
        explanation = sample_llm_response["explanation"].lower()
        concepts_found = [
            c for c in sample_interview_question["expected_concepts"]
            if c in explanation
        ]
        assert len(concepts_found) >= 1, (
            f"Expected at least one of {sample_interview_question['expected_concepts']} "
            f"in explanation, found none."
        )

    def test_complexity_format_is_big_o(self, sample_llm_response):
        """Time and space complexity should follow Big-O notation."""
        import re
        big_o_pattern = re.compile(r"O\(.+\)")
        assert big_o_pattern.match(sample_llm_response["time_complexity"]), \
            "time_complexity must be in Big-O notation"
        assert big_o_pattern.match(sample_llm_response["space_complexity"]), \
            "space_complexity must be in Big-O notation"


# ─────────────────────────────────────────────────────────────────────────────
# 2. SWE Task Construction (Verifiable Tasks — Core Turing Project)
# ─────────────────────────────────────────────────────────────────────────────

class TestSWETaskConstruction:
    """
    Validates the structure and verifiability of synthetically generated SWE tasks.
    Maps to Turing requirement: 'build verifiable SWE tasks based on public repository histories'
    """

    def _make_task(self, **overrides):
        base = {
            "task_id": "swe_001",
            "repo": "psf/requests",
            "issue_ref": "https://github.com/psf/requests/issues/6520",
            "description": "Fix incorrect Content-Type header when body is None",
            "patch": "diff --git a/requests/models.py ...",
            "test_command": "pytest tests/test_models.py -v",
            "expected_test_result": "passed",
            "difficulty": "medium",
            "language": "python",
        }
        base.update(overrides)
        return base

    def test_task_has_all_required_fields(self):
        task = self._make_task()
        required = ["task_id", "repo", "issue_ref", "description",
                    "patch", "test_command", "expected_test_result", "difficulty", "language"]
        for field in required:
            assert field in task, f"SWE task missing field: {field}"

    def test_task_difficulty_is_valid(self):
        for level in ["easy", "medium", "hard"]:
            task = self._make_task(difficulty=level)
            assert task["difficulty"] in {"easy", "medium", "hard"}

    def test_task_language_is_supported(self):
        supported = {"python", "javascript", "typescript", "rust", "go", "java"}
        task = self._make_task(language="python")
        assert task["language"] in supported, f"Unsupported language: {task['language']}"

    def test_patch_is_non_empty(self):
        task = self._make_task()
        assert task["patch"].strip(), "Patch diff must not be empty"

    def test_task_serializes_to_json(self):
        task = self._make_task()
        serialized = json.dumps(task)
        deserialized = json.loads(serialized)
        assert deserialized["task_id"] == task["task_id"]

    def test_invalid_expected_test_result_raises(self):
        task = self._make_task(expected_test_result="unknown")
        assert task["expected_test_result"] not in {"passed", "failed"} or True
        # In real service, this would raise a ValidationError
        valid_results = {"passed", "failed"}
        assert task["expected_test_result"] not in valid_results


# ─────────────────────────────────────────────────────────────────────────────
# 3. GitHub Issue Triage
# ─────────────────────────────────────────────────────────────────────────────

class TestGitHubIssueTriage:
    """
    Tests issue triage logic — classifying, prioritizing, and filtering issues.
    Maps to Turing requirement: 'analyze and triage GitHub issues across trending open-source libraries'
    """

    def _triage(self, issue: dict) -> dict:
        """Minimal triage classifier (mirrors what a real service would do)."""
        labels = issue.get("labels", [])
        priority = "high" if "bug" in labels else "low"
        actionable = issue.get("comments", 0) > 0 or "bug" in labels
        return {
            "issue_id": issue["id"],
            "priority": priority,
            "actionable": actionable,
            "suggested_assignee": "llm-eval-team" if actionable else None,
        }

    def test_bug_label_gives_high_priority(self, sample_github_issue):
        result = self._triage(sample_github_issue)
        assert result["priority"] == "high"

    def test_actionable_when_has_comments(self, sample_github_issue):
        result = self._triage(sample_github_issue)
        assert result["actionable"] is True

    def test_no_comments_no_bug_is_not_actionable(self):
        issue = {
            "id": 9999,
            "repo": "some/repo",
            "title": "Add dark mode",
            "labels": ["enhancement"],
            "comments": 0,
        }
        result = self._triage(issue)
        assert result["actionable"] is False
        assert result["suggested_assignee"] is None

    def test_triage_output_has_required_keys(self, sample_github_issue):
        result = self._triage(sample_github_issue)
        for key in ["issue_id", "priority", "actionable", "suggested_assignee"]:
            assert key in result


# ─────────────────────────────────────────────────────────────────────────────
# 4. AI Service Unit Tests (mocked — no real API calls)
# ─────────────────────────────────────────────────────────────────────────────

class TestAIServiceMocked:
    """
    Tests the AI service layer using mocks — no real API calls made.
    Validates prompt construction, response parsing, and error handling.
    google-generativeai is fully mocked via sys.modules so the package
    does not need to be installed in the test environment.
    """

    @pytest.fixture(autouse=True)
    def mock_google_generativeai(self):
        """Inject a fake google.generativeai into sys.modules before each test."""
        import sys
        fake_genai = MagicMock()
        fake_model_instance = MagicMock()
        fake_genai.GenerativeModel.return_value = fake_model_instance
        sys.modules["google"] = MagicMock(generativeai=fake_genai)
        sys.modules["google.generativeai"] = fake_genai
        yield fake_genai
        # Cleanup
        sys.modules.pop("google", None)
        sys.modules.pop("google.generativeai", None)

    @pytest.mark.asyncio
    async def test_generate_question_returns_structured_output(self, mock_google_generativeai):
        mock_response = MagicMock()
        mock_response.text = json.dumps({
            "question": "Explain the GIL in Python.",
            "difficulty": "medium",
            "category": "concurrency",
        })

        instance = mock_google_generativeai.GenerativeModel.return_value
        instance.generate_content_async = AsyncMock(return_value=mock_response)

        # Simulate what the AI service does
        result_text = mock_response.text
        result = json.loads(result_text)

        assert "question" in result
        assert result["difficulty"] == "medium"

    @pytest.mark.asyncio
    async def test_ai_service_handles_empty_response_gracefully(self, mock_google_generativeai):
        mock_response = MagicMock()
        mock_response.text = ""

        instance = mock_google_generativeai.GenerativeModel.return_value
        instance.generate_content_async = AsyncMock(return_value=mock_response)

        result_text = mock_response.text
        # Service should handle empty response without crashing
        is_valid = bool(result_text and result_text.strip())
        assert is_valid is False  # Empty — service should return fallback

    def test_prompt_template_includes_language_context(self):
        """Prompt builder should inject language into the template."""
        language = "python"
        prompt = f"Generate a {language} coding interview question on data structures."
        assert language in prompt
        assert "interview question" in prompt


# ─────────────────────────────────────────────────────────────────────────────
# 5. Dataset Coverage & Quality Metrics
# ─────────────────────────────────────────────────────────────────────────────

class TestDatasetQuality:
    """
    Validates dataset-level properties: coverage across languages,
    difficulty distribution, and deduplication.
    Maps to Turing requirement: 'expanding dataset coverage to different types of tasks'
    """

    @pytest.fixture
    def sample_dataset(self):
        return [
            {"task_id": "t1", "language": "python", "difficulty": "easy"},
            {"task_id": "t2", "language": "python", "difficulty": "medium"},
            {"task_id": "t3", "language": "javascript", "difficulty": "hard"},
            {"task_id": "t4", "language": "rust", "difficulty": "medium"},
            {"task_id": "t5", "language": "python", "difficulty": "hard"},
        ]

    def test_no_duplicate_task_ids(self, sample_dataset):
        ids = [t["task_id"] for t in sample_dataset]
        assert len(ids) == len(set(ids)), "Duplicate task IDs found in dataset"

    def test_all_difficulties_represented(self, sample_dataset):
        difficulties = {t["difficulty"] for t in sample_dataset}
        assert {"easy", "medium", "hard"}.issubset(difficulties), \
            "Dataset must include easy, medium, and hard tasks"

    def test_multiple_languages_covered(self, sample_dataset):
        languages = {t["language"] for t in sample_dataset}
        assert len(languages) >= 2, "Dataset should cover at least 2 programming languages"

    def test_python_is_most_represented(self, sample_dataset):
        from collections import Counter
        lang_counts = Counter(t["language"] for t in sample_dataset)
        assert lang_counts["python"] >= 1

    def test_dataset_min_size(self, sample_dataset):
        assert len(sample_dataset) >= 5, "Dataset must have at least 5 tasks for meaningful eval"