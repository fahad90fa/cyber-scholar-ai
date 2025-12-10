# Token Cost Configuration

This file documents how to change token deduction costs in your CyberScholar application.

## Current Settings

- **Cost per message**: 1.0 token (previously 1.76)
- **Cost per character response**: 0.0 token (disabled)
- **Method**: Per-message deduction

## How to Change Token Costs

### Option 1: Via Supabase Dashboard (Recommended)

1. Go to your Supabase Dashboard
2. Navigate to SQL Editor
3. Run this command to change cost to 1 token per message:

```sql
UPDATE token_config 
SET cost_per_message = 1.0, enabled_per_message = true 
WHERE id IS NOT NULL;
```

4. Or if you want 1.76 tokens per message:

```sql
UPDATE token_config 
SET cost_per_message = 1.76, enabled_per_message = true 
WHERE id IS NOT NULL;
```

### Option 2: Via Admin API

**Endpoint**: `PUT /api/v1/admin/token-config`

**Request Body**:
```json
{
  "cost_per_message": 1.0,
  "enabled_per_message": true
}
```

**Headers**:
```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

## Pricing Models

### Model 1: Fixed Cost Per Message (Recommended)
- Charge same tokens regardless of response length
- Example: 1 token per message
- Set: `cost_per_message: 1.0`, `enabled_per_message: true`, `enabled_per_character: false`

### Model 2: Cost Based on Response Length
- Charge tokens based on how many characters AI returns
- Example: 0.01 tokens per character
- Set: `cost_per_message: 0`, `enabled_per_message: false`, `cost_per_character_response: 0.01`, `enabled_per_character: true`

### Model 3: Hybrid (Both)
- Charge fixed amount + variable amount per character
- Example: 0.5 base + 0.005 per character
- Set: `cost_per_message: 0.5`, `enabled_per_message: true`, `cost_per_character_response: 0.005`, `enabled_per_character: true`

## Database Structure

Table: `token_config`
- `cost_per_message` (DECIMAL): Tokens to deduct per message sent
- `cost_per_character_response` (DECIMAL): Tokens per character in AI response
- `enabled_per_message` (BOOLEAN): Enable message-based deduction
- `enabled_per_character` (BOOLEAN): Enable character-based deduction

## Applying Changes

After updating the configuration:

1. **No deployment needed** - changes take effect immediately
2. **All new messages** will use the new token cost
3. **Existing token transactions** are not affected (historical record)

## Common Configurations

### Free Tier (1 token per message)
```sql
UPDATE token_config 
SET cost_per_message = 1.0, 
    enabled_per_message = true,
    enabled_per_character = false;
```

### Premium Tier (0.5 tokens per message)
```sql
UPDATE token_config 
SET cost_per_message = 0.5, 
    enabled_per_message = true,
    enabled_per_character = false;
```

### Custom (1.76 tokens per message - Original)
```sql
UPDATE token_config 
SET cost_per_message = 1.76, 
    enabled_per_message = true,
    enabled_per_character = false;
```

### Per-Character (0.01 tokens per 100 chars)
```sql
UPDATE token_config 
SET cost_per_message = 0, 
    enabled_per_message = false,
    cost_per_character_response = 0.01,
    enabled_per_character = true;
```
