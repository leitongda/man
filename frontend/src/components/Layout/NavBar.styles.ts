import styled from 'styled-components'

export const NavbarInner = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
  padding: 0 20px;
`

export const NavbarLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`

export const NavbarRight = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`

export const Logo = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
  &:hover {
    opacity: 0.8;
  }
`

export const IconBtn = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 4px;
  cursor: pointer;
  color: var(--color-text-2);
  transition: all 0.2s;
  &:hover {
    background-color: var(--color-fill-2);
    color: var(--color-text-1);
  }
`

export const MenuIcon = styled.span`
  margin-right: 8px;
`

export const UserInfoDisabled = styled.div`
  padding: 4px 0;
`

export const UserInfoName = styled.div`
  font-weight: 500;
`

export const UserInfoEmail = styled.div`
  font-size: 12px;
  color: var(--color-text-3);
`

export const UserTrigger = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;
  gap: 8px;
`

export const UserName = styled.span`
  font-size: 14px;
  color: var(--color-text-1);
`
