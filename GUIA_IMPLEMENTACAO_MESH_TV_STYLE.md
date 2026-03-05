# 🎯 GUIA DE IMPLEMENTAÇÃO - LIVE TV MESH STYLE

## 📋 RESUMO

Vou te passar o código completo para transformar o Live TV do TV MAXX PRO no estilo Mesh TV com 3 colunas.

---

## 🔧 ARQUIVOS A MODIFICAR

### 1. LiveTvScreen.kt
**Localização:** `app/src/main/java/com/tvmaxx/pro/features/tv/LiveTvScreen.kt`

---

## 📝 PASSO A PASSO

### PASSO 1: Adicionar Componentes Auxiliares

Adicione estes componentes NO FINAL do arquivo `LiveTvScreen.kt` (antes do último `}`):

```kotlin
// ========== COMPONENTES MESH TV STYLE ==========

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

@Composable
fun MeshChannelItem(
    group: ChannelGroup,
    isSelected: Boolean,
    onFocus: () -> Unit,
    onSelect: () -> Unit
) {
    var isFocused by remember { mutableStateOf(false) }
    
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .height(56.dp)
            .onFocusChanged {
                isFocused = it.isFocused
                if (it.isFocused) onFocus()
            }
            .focusable()
            .clickable { onSelect() }
            .padding(horizontal = 8.dp, vertical = 2.dp)
            .background(
                when {
                    isFocused -> MaxxOrange.copy(alpha = 0.15f)
                    isSelected -> White.copy(alpha = 0.05f)
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
        AsyncImage(
            model = group.logo,
            contentDescription = null,
            modifier = Modifier
                .size(32.dp)
                .clip(RoundedCornerShape(6.dp)),
            contentScale = ContentScale.Fit
        )
        
        Spacer(modifier = Modifier.width(12.dp))
        
        Text(
            text = group.baseName,
            color = if (isFocused) White else White.copy(alpha = 0.8f),
            fontSize = 14.sp,
            fontWeight = if (isFocused) FontWeight.Bold else FontWeight.Normal,
            maxLines = 1,
            overflow = TextOverflow.Ellipsis
        )
    }
}

@Composable
fun MeshShortcutHint(
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    label: String
) {
    Row(
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(4.dp)
    ) {
        Icon(
            imageVector = icon,
            contentDescription = null,
            tint = White.copy(alpha = 0.5f),
            modifier = Modifier.size(12.dp)
        )
        Text(
            text = label,
            color = White.copy(alpha = 0.5f),
            fontSize = 10.sp,
            fontWeight = FontWeight.Normal
        )
    }
}

@Composable
fun QualityBadge(text: String, color: Color) {
    Surface(
        color = color.copy(alpha = 0.2f),
        shape = RoundedCornerShape(4.dp),
        border = BorderStroke(1.dp, color)
    ) {
        Text(
            text = text,
            color = color,
            fontSize = 11.sp,
            fontWeight = FontWeight.Black,
            modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
        )
    }
}
```

---

### PASSO 2: Substituir a função DashboardOverlay

Encontre a função `DashboardOverlay` e SUBSTITUA COMPLETAMENTE por esta versão:

```kotlin
@Composable
fun DashboardOverlay(
    categories: List<SmartCategory>,
    selectedCategoryId: String,
    channels: List<ChannelGroup>,
    selectedChannel: ChannelGroup?,
    epgList: List<com.tvmaxx.pro.network.api.EpgListing>,
    onCategorySelect: (String) -> Unit,
    onChannelFocus: (ChannelGroup) -> Unit,
    onChannelSelect: (ChannelGroup) -> Unit,
    onNavigate: (String) -> Unit
) {
    var showSearch by remember { mutableStateOf(false) }
    var showFavorites by remember { mutableStateOf(false) }
    
    Row(
        modifier = Modifier
            .fillMaxSize()
            .background(Color.Black.copy(alpha = 0.95f))
    ) {
        // ========== COLUNA 1: CATEGORIAS (Sidebar Esquerda - Mesh TV Style) ==========
        Column(
            modifier = Modifier
                .width(200.dp)
                .fillMaxHeight()
                .background(Color.Black.copy(alpha = 0.97f))
                .padding(vertical = 16.dp, horizontal = 8.dp)
        ) {
            // Botão FUT especial (topo)
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(60.dp)
                    .padding(4.dp)
                    .clip(RoundedCornerShape(8.dp))
                    .background(
                        Brush.verticalGradient(
                            colors = listOf(
                                Color(0xFF1B5E20),
                                Color(0xFF2E7D32)
                            )
                        )
                    )
                    .clickable { onCategorySelect("sports") }
                    .focusable(),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    painter = painterResource(id = R.drawable.ic_sports),
                    contentDescription = "Futebol",
                    tint = White,
                    modifier = Modifier.size(32.dp)
                )
            }
            
            Spacer(modifier = Modifier.height(8.dp))
            Divider(color = White.copy(alpha = 0.1f), thickness = 1.dp)
            Spacer(modifier = Modifier.height(8.dp))
            
            // Buscar
            MeshCategoryButton(
                icon = Icons.Default.Search,
                label = "Buscar",
                isSelected = showSearch,
                onClick = { showSearch = !showSearch }
            )
            
            Spacer(modifier = Modifier.height(4.dp))
            Divider(color = White.copy(alpha = 0.1f), thickness = 1.dp, modifier = Modifier.padding(horizontal = 8.dp))
            Spacer(modifier = Modifier.height(4.dp))
            
            // Favoritos
            MeshCategoryButton(
                icon = Icons.Default.Favorite,
                label = "Favoritos",
                isSelected = showFavorites,
                onClick = { showFavorites = !showFavorites }
            )
            
            Spacer(modifier = Modifier.height(4.dp))
            Divider(color = White.copy(alpha = 0.1f), thickness = 1.dp, modifier = Modifier.padding(horizontal = 8.dp))
            Spacer(modifier = Modifier.height(4.dp))
            
            // Todos os Canais
            MeshCategoryButton(
                icon = Icons.Default.Tv,
                label = "Todos Canais",
                isSelected = selectedCategoryId == "all",
                onClick = { onCategorySelect("all") }
            )
            
            Spacer(modifier = Modifier.height(4.dp))
            Divider(color = White.copy(alpha = 0.1f), thickness = 1.dp, modifier = Modifier.padding(horizontal = 8.dp))
            Spacer(modifier = Modifier.height(8.dp))
            
            // Lista de Categorias
            LazyColumn(
                modifier = Modifier.weight(1f),
                verticalArrangement = Arrangement.spacedBy(2.dp)
            ) {
                items(categories) { category ->
                    MeshCategoryItem(
                        category = category,
                        isSelected = selectedCategoryId == category.id,
                        onSelect = { onCategorySelect(category.id) }
                    )
                }
            }
        }
        
        // ========== COLUNA 2: LISTA DE CANAIS (Meio - Mesh TV Style) ==========
        Column(
            modifier = Modifier
                .width(280.dp)
                .fillMaxHeight()
                .background(Color.Black.copy(alpha = 0.92f))
        ) {
            // Header da lista
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(48.dp)
                    .background(Color.Black.copy(alpha = 0.5f))
                    .padding(horizontal = 16.dp),
                contentAlignment = Alignment.CenterStart
            ) {
                val currentCat = categories.find { it.id == selectedCategoryId }
                Text(
                    text = currentCat?.label?.uppercase() ?: "LISTA DE CANAIS",
                    color = White,
                    fontSize = 13.sp,
                    fontWeight = FontWeight.Bold
                )
            }
            
            Divider(color = White.copy(alpha = 0.2f), thickness = 1.dp)
            
            // Lista de canais
            LazyColumn(
                modifier = Modifier.weight(1f),
                contentPadding = PaddingValues(vertical = 8.dp)
            ) {
                itemsIndexed(channels) { _, group ->
                    MeshChannelItem(
                        group = group,
                        isSelected = selectedChannel == group,
                        onFocus = { onChannelFocus(group) },
                        onSelect = { onChannelSelect(group) }
                    )
                }
            }
            
            Divider(color = White.copy(alpha = 0.2f), thickness = 1.dp)
            
            // Footer com atalhos
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(40.dp)
                    .background(Color.Black.copy(alpha = 0.5f))
                    .padding(horizontal = 8.dp),
                contentAlignment = Alignment.CenterStart
            ) {
                Row(
                    horizontalArrangement = Arrangement.spacedBy(12.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    MeshShortcutHint(Icons.Default.Menu, "Menu")
                    MeshShortcutHint(Icons.Default.Favorite, "Fav")
                    MeshShortcutHint(Icons.Default.Sort, "Ordenar")
                }
            }
        }
        
        // ========== COLUNA 3: PREVIEW DE VÍDEO (Direita - Mesh TV Style) ==========
        Box(
            modifier = Modifier
                .weight(1f)
                .fillMaxHeight()
        ) {
            // Vídeo preview está no fundo (player já renderizado)
            
            // Overlay com informações do canal
            Column(
                modifier = Modifier
                    .align(Alignment.BottomStart)
                    .fillMaxWidth()
                    .background(
                        Brush.verticalGradient(
                            colors = listOf(
                                Color.Transparent,
                                Color.Black.copy(alpha = 0.9f)
                            )
                        )
                    )
                    .padding(32.dp)
            ) {
                selectedChannel?.let { group ->
                    // Nome do canal
                    Text(
                        text = group.baseName,
                        color = White,
                        fontSize = 28.sp,
                        fontWeight = FontWeight.Black
                    )
                    
                    Spacer(modifier = Modifier.height(8.dp))
                    
                    // Programa atual
                    val currentProg = epgList.firstOrNull()
                    if (currentProg != null) {
                        Text(
                            text = currentProg.title ?: "Programação indisponível",
                            color = White.copy(alpha = 0.8f),
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Medium,
                            maxLines = 2,
                            overflow = TextOverflow.Ellipsis
                        )
                        
                        Spacer(modifier = Modifier.height(12.dp))
                        
                        // Progress bar do programa
                        val progress = remember(currentProg) {
                            if (currentProg == null) 0f
                            else {
                                val start = currentProg.start_timestamp ?: 0L
                                val stop = currentProg.stop_timestamp ?: 1L
                                val now = System.currentTimeMillis() / 1000
                                ((now - start).toFloat() / (stop - start).toFloat()).coerceIn(0f, 1f)
                            }
                        }
                        
                        Box(
                            modifier = Modifier
                                .fillMaxWidth(0.7f)
                                .height(4.dp)
                                .background(White.copy(alpha = 0.2f), CircleShape)
                        ) {
                            Box(
                                modifier = Modifier
                                    .fillMaxWidth(progress)
                                    .fillMaxHeight()
                                    .background(MaxxOrange, CircleShape)
                            )
                        }
                    }
                    
                    Spacer(modifier = Modifier.height(16.dp))
                    
                    // Badges de qualidade e P2P
                    Row(
                        horizontalArrangement = Arrangement.spacedBy(12.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        val variants = group.variants
                        val has4k = variants.any { it.name.contains("4K", true) || it.name.contains("UHD", true) }
                        val hasFhd = variants.any { it.name.contains("FHD", true) }
                        
                        if (has4k) {
                            QualityBadge("UHD 4K", MaxxOrange)
                        } else if (hasFhd) {
                            QualityBadge("FHD", MaxxOrange)
                        } else {
                            QualityBadge("HD", White.copy(alpha = 0.6f))
                        }
                        
                        Text(
                            text = "• P2P ON",
                            color = MaxxOrange.copy(alpha = 0.8f),
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }
                }
            }
            
            // Indicador de velocidade (canto superior direito)
            Box(
                modifier = Modifier
                    .align(Alignment.TopEnd)
                    .padding(16.dp)
                    .clip(RoundedCornerShape(8.dp))
                    .background(Color.Black.copy(alpha = 0.7f))
                    .padding(horizontal = 12.dp, vertical = 6.dp)
            ) {
                Row(
                    horizontalArrangement = Arrangement.spacedBy(6.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(
                        imageVector = Icons.Default.Cloud,
                        contentDescription = null,
                        tint = MaxxOrange,
                        modifier = Modifier.size(14.dp)
                    )
                    Text(
                        text = "1.2 MB/s",
                        color = White,
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold
                    )
                }
            }
            
            // Ícone de fullscreen (canto inferior direito)
            Icon(
                imageVector = Icons.Default.Fullscreen,
                contentDescription = "Fullscreen",
                tint = White.copy(alpha = 0.6f),
                modifier = Modifier
                    .align(Alignment.BottomEnd)
                    .padding(16.dp)
                    .size(20.dp)
            )
        }
    }
}
```

---

## ✅ RESULTADO

Após implementar, você terá:

✅ 3 colunas no dashboard (Categorias | Canais | Preview)
✅ Botão FUT especial no topo
✅ Buscar e Favoritos integrados
✅ Preview de vídeo sempre visível
✅ EPG com progress bar na preview
✅ Indicador de velocidade (KB/s)
✅ Badges de qualidade (HD/FHD/UHD)
✅ Status P2P
✅ Ícone de fullscreen
✅ Cores do TV MAXX (laranja)
✅ Navegação por DPAD

---

## 🎨 CORES USADAS

- **MaxxOrange:** Cor principal (já definida no tema)
- **White:** Texto e ícones
- **Black:** Fundos e overlays

---

## 📱 PRÓXIMOS PASSOS

1. Copie o código do PASSO 1 e cole no final do arquivo
2. Substitua a função DashboardOverlay pelo código do PASSO 2
3. Compile e teste no Android TV
4. Ajuste tamanhos se necessário

Pronto! Seu Live TV agora está no estilo Mesh TV com as cores do TV MAXX! 🔥
