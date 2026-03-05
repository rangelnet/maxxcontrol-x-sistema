// ========== PARTE 1: COMPONENTES AUXILIARES ==========
// Adicionar no final do arquivo LiveTvScreen.kt

@Composable
fun MeshCategoryButton(
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    label: String,
    isSelected: Boolean,
    onClick: () -> Unit
) {
    var isFocused by remember { mutableStateOf(false) }
    
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .height(48.dp)
            .onFocusChanged { isFocused = it.isFocused }
            .focusable()
            .clickable { onClick() }
            .padding(horizontal = 8.dp, vertical = 4.dp)
            .background(
                when {
                    isFocused -> MaxxOrange.copy(alpha = 0.2f)
                    isSelected -> MaxxOrange.copy(alpha = 0.1f)
                    else -> Color.Transparent
                },
                RoundedCornerShape(8.dp)
            )
            .border(
                width = if (isFocused) 2.dp else 0.dp,
                color = if (isFocused) MaxxOrange else Color.Transparent,
                shape = RoundedCornerShape(8.dp)
            )
            .padding(horizontal = 12.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Icon(
            imageVector = icon,
            contentDescription = null,
            tint = if (isFocused || isSelected) MaxxOrange else White.copy(alpha = 0.6f),
            modifier = Modifier.size(18.dp)
        )
        Spacer(modifier = Modifier.width(12.dp))
        Text(
            text = label,
            color = if (isFocused || isSelected) White else White.copy(alpha = 0.7f),
            fontSize = 13.sp,
            fontWeight = if (isFocused || isSelected) FontWeight.Bold else FontWeight.Normal
        )
    }
}

@Composable
fun MeshCategoryItem(
    category: SmartCategory,
    isSelected: Boolean,
    onSelect: () -> Unit
) {
    var isFocused by remember { mutableStateOf(false) }
    
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .height(44.dp)
            .onFocusChanged { isFocused = it.isFocused }
            .focusable()
            .clickable { onSelect() }
            .padding(horizontal = 8.dp, vertical = 2.dp)
            .background(
                when {
                    isFocused -> MaxxOrange.copy(alpha = 0.2f)
                    isSelected -> MaxxOrange.copy(alpha = 0.1f)
                    else -> Color.Transparent
                },
                RoundedCornerShape(8.dp)
            )
            .border(
                width = if (isFocused) 2.dp else 0.dp,
                color = if (isFocused) MaxxOrange else Color.Transparent,
                shape = RoundedCornerShape(8.dp)
            )
            .padding(horizontal = 12.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Icon(
            painter = painterResource(id = category.iconRes),
            contentDescription = null,
            tint = if (isFocused || isSelected) MaxxOrange else White.copy(alpha = 0.6f),
            modifier = Modifier.size(16.dp)
        )
        Spacer(modifier = Modifier.width(12.dp))
        Text(
            text = category.label.uppercase(),
            color = if (isFocused || isSelected) White else White.copy(alpha = 0.7f),
            fontSize = 12.sp,
            fontWeight = if (isFocused || isSelected) FontWeight.Bold else FontWeight.Normal
        )
    }
}
